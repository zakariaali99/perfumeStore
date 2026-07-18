import os
import shutil
import zipfile
import tempfile
from django.conf import settings
from django.db import connections
from django.core.management import call_command
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, Http404
from .models import Backup
from .serializers import BackupSerializer


class BackupViewSet(viewsets.ModelViewSet):
    queryset = Backup.objects.all()
    serializer_class = BackupSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'post', 'delete']

    def create(self, request, *args, **kwargs):
        backup = Backup.objects.create(status='creating')

        try:
            timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
            filename = f'backup_{timestamp}.zip'
            temp_dir = tempfile.mkdtemp()

            db_path = settings.DATABASES['default']['NAME']
            shutil.copy2(db_path, os.path.join(temp_dir, 'db.sqlite3'))

            media_temp = os.path.join(temp_dir, 'media')
            if os.path.isdir(settings.MEDIA_ROOT):
                shutil.copytree(
                    settings.MEDIA_ROOT,
                    media_temp,
                    ignore=shutil.ignore_patterns('backups'),
                )

            backup_dir = os.path.join(settings.MEDIA_ROOT, 'backups')
            os.makedirs(backup_dir, exist_ok=True)
            zip_path = os.path.join(backup_dir, filename)

            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, temp_dir)
                        zf.write(file_path, arcname)

            backup.file.name = f'backups/{filename}'
            backup.file_size = os.path.getsize(zip_path)
            backup.status = 'ready'
            backup.save()

            shutil.rmtree(temp_dir)
            serializer = self.get_serializer(backup)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            backup.status = 'failed'
            backup.notes = str(e)
            backup.save()
            if 'zip_path' in locals() and os.path.exists(zip_path):
                os.remove(zip_path)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        backup = self.get_object()
        if backup.status != 'ready':
            return Response(
                {'error': 'النسخة الاحتياطية غير جاهزة'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        file_path = backup.file.path
        if not os.path.exists(file_path):
            raise Http404('الملف غير موجود')
        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/zip',
        )
        response['Content-Disposition'] = (
            f'attachment; filename="{os.path.basename(file_path)}"'
        )
        return response

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        backup = self.get_object()
        if backup.status != 'ready':
            return Response(
                {'error': 'النسخة الاحتياطية غير جاهزة'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        backup.status = 'restoring'
        backup.save(update_fields=['status'])

        result = self._perform_restore(backup.file.path)

        if result.status_code != status.HTTP_200_OK:
            backup.status = 'failed'
            backup.notes = result.data.get('error', '')
            backup.save(update_fields=['status', 'notes'])

        return result

    @action(detail=False, methods=['post'], url_path='restore-upload')
    def restore_from_upload(self, request):
        uploaded_file = request.FILES.get('backup_file')
        if not uploaded_file:
            return Response(
                {'error': 'لم يتم تحميل أي ملف'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        temp_dir = tempfile.mkdtemp()
        safe_name = os.path.basename(uploaded_file.name)
        temp_zip = os.path.join(temp_dir, safe_name)
        with open(temp_zip, 'wb') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        result = self._perform_restore(temp_zip)
        shutil.rmtree(temp_dir, ignore_errors=True)
        return result

    def _perform_restore(self, zip_path):
        temp_dir = None
        try:
            temp_dir = tempfile.mkdtemp()

            with zipfile.ZipFile(zip_path, 'r') as zf:
                zf.extractall(temp_dir)

            extracted_db = os.path.join(temp_dir, 'db.sqlite3')
            extracted_media = os.path.join(temp_dir, 'media')

            if not os.path.exists(extracted_db):
                raise Exception('ملف قاعدة البيانات غير موجود في الأرشيف')

            connections.close_all()

            db_path = settings.DATABASES['default']['NAME']

            safety_backup = db_path + '.safety_backup'
            shutil.copy2(db_path, safety_backup)

            try:
                shutil.copy2(extracted_db, db_path)

                if os.path.exists(extracted_media) and os.path.isdir(extracted_media):
                    for item in os.listdir(extracted_media):
                        src = os.path.join(extracted_media, item)
                        dst = os.path.join(settings.MEDIA_ROOT, item)
                        if item == 'backups':
                            continue
                        if os.path.isdir(src):
                            if os.path.exists(dst):
                                shutil.rmtree(dst)
                            shutil.copytree(src, dst)
                        else:
                            shutil.copy2(src, dst)

                call_command('migrate', '--noinput')

            except Exception:
                shutil.copy2(safety_backup, db_path)
                raise
            finally:
                if os.path.exists(safety_backup):
                    os.remove(safety_backup)

            return Response(
                {'success': 'تمت الاستعادة بنجاح'},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            if temp_dir:
                shutil.rmtree(temp_dir, ignore_errors=True)
