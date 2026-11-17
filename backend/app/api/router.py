"""API v1 router — composes every module's routers.

To add a module: create app/modules/<name>/{models,schemas,service,router}.py,
register its model in app/models.py, then include its routers here.
"""

from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.contacts import router as contacts
from app.modules.courses import router as courses
from app.modules.curriculum import router as curriculum
from app.modules.dashboard.router import router as dashboard_router
from app.modules.enrollments import router as enrollments
from app.modules.posts import router as posts
from app.modules.users import router as users

api_router = APIRouter()

# Public & auth
api_router.include_router(auth_router)
api_router.include_router(users.me_router)
api_router.include_router(courses.public_router)
api_router.include_router(curriculum.public_router)
api_router.include_router(posts.public_router)
api_router.include_router(contacts.public_router)

# Learner area (any authenticated user)
api_router.include_router(enrollments.me_router)

# Admin (RBAC enforced per router)
admin = APIRouter(prefix="/admin")
admin.include_router(dashboard_router)
admin.include_router(courses.admin_router)
admin.include_router(curriculum.admin_router)
admin.include_router(enrollments.admin_router)
admin.include_router(posts.admin_router)
admin.include_router(contacts.admin_router)
admin.include_router(users.admin_router)
api_router.include_router(admin)
