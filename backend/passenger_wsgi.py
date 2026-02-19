import os
import sys

# Define absolute paths for stability
project_root = os.path.dirname(os.path.abspath(__file__))
apps_path = os.path.join(project_root, 'apps')

# Ensure paths are at the top of sys.path
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if apps_path not in sys.path:
    sys.path.insert(0, apps_path)

# FORCE the settings module (Don't use setdefault here)
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.base'

# Import Django and initialize
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception as e:
    # Error catching for cPanel logs
    import traceback
    print("CRITICAL: Failed to load WSGI application")
    print(traceback.format_exc())
    
    # Generic status for the loader
    def application(environ, start_response):
        status = '500 Internal Server Error'
        output = f"Application Error: {str(e)}".encode('utf-8')
        response_headers = [('Content-type', 'text/plain'), ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]
