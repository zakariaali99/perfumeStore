import os
import sys

# Add the application directory to the python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'apps'))

# Set the settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.base")

# Import the WSGI application
from django.core.wsgi import get_wsgi_application

# Wrapper to catch errors and log them (Crucial for cPanel debugging)
def application(environ, start_response):
    try:
        _app = get_wsgi_application()
        return _app(environ, start_response)
    except Exception as e:
        # Simple error response for debugging
        status = '500 Internal Server Error'
        output = str(e).encode('utf-8')
        response_headers = [('Content-type', 'text/plain'), ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        
        # Also try to log to a file
        with open(os.path.join(project_root, 'error_log.txt'), 'a') as f:
            import traceback
            f.write("\n--- Error ---\n")
            f.write(traceback.format_exc())
            
        return [output]
