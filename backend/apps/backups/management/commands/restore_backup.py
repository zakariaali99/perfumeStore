import os
import shutil
import zipfile
import tempfile
from django.conf import settings
from django.db import connections
from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Restore system from a backup zip file'

    def add_arguments(self, parser):
        parser.add_argument('zip_path', type=str, help='Path to backup zip file')

    def handle(self, *args, **options):
        zip_path = options['zip_path']

        if not os.path.exists(zip_path):
            raise CommandError(f'File not found: {zip_path}')

        temp_dir = None
        try:
            temp_dir = tempfile.mkdtemp()
            self.stdout.write('Extracting backup archive...')

            with zipfile.ZipFile(zip_path, 'r') as zf:
                zf.extractall(temp_dir)

            extracted_db = os.path.join(temp_dir, 'db.sqlite3')
            extracted_media = os.path.join(temp_dir, 'media')

            if not os.path.exists(extracted_db):
                raise CommandError('Database file not found in archive')

            connections.close_all()

            db_path = settings.DATABASES['default']['NAME']

            safety_backup = db_path + '.safety_backup'
            shutil.copy2(db_path, safety_backup)

            try:
                shutil.copy2(extracted_db, db_path)
                self.stdout.write(self.style.SUCCESS('Database restored'))

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
                    self.stdout.write(self.style.SUCCESS('Media files restored'))

                self.stdout.write('Running migrations...')
                call_command('migrate', '--noinput')
                self.stdout.write(self.style.SUCCESS('Migrations complete'))

            except Exception:
                shutil.copy2(safety_backup, db_path)
                raise
            finally:
                if os.path.exists(safety_backup):
                    os.remove(safety_backup)

        except CommandError:
            raise
        except Exception as e:
            raise CommandError(f'Restore failed: {e}')
        finally:
            if temp_dir:
                shutil.rmtree(temp_dir, ignore_errors=True)
