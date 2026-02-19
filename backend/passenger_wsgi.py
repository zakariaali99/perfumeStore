import os
import sys
import traceback

# Define absolute paths for stability
project_root = os.path.dirname(os.path.abspath(__file__))

# Log the start of the file to verify it's being executed
with open(os.path.join(project_root, 'debug_init.txt'), 'w') as f:
    f.write(f"Passenger WSGI initialized at {project_root}\n")
    f.write(f"Python executable: {sys.executable}\n")

try:
    # Add paths
    apps_path = os.path.join(project_root, 'apps')
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    if apps_path not in sys.path:
        sys.path.insert(0, apps_path)

    # FORCE the settings module
    os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.base'

    # Import Django and initialize
    from django.core.wsgi import get_wsgi_application
    _application = get_wsgi_application()

    def application(environ, start_response):
        try:
            return _application(environ, start_response)
        except Exception as e:
            with open(os.path.join(project_root, 'error_log.txt'), 'a') as f:
                f.write(f"\n--- Runtime Error: {str(e)} ---\n")
                f.write(traceback.format_exc())
            
            status = '500 Internal Server Error'
            output = f"System Error: {str(e)}".encode('utf-8')
            response_headers = [('Content-type', 'text/plain'), ('Content-Length', str(len(output)))]
            start_response(status, response_headers)
            return [output]

except Exception as e:
    # Catch import-time errors
    with open(os.path.join(project_root, 'error_log.txt'), 'a') as f:
        f.write(f"\n--- Import Error: {str(e)} ---\n")
        f.write(traceback.format_exc())
    
    def application(environ, start_response):
        status = '500 Internal Server Error'
        output = f"Critical Startup Error: {str(e)}".encode('utf-8')
        response_headers = [('Content-type', 'text/plain'), ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]
