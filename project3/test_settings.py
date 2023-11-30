from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR + 'db_test.sqlite3',
    }
}
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'