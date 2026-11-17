from app.modules.courses.models import Course
from app.shared.repository import BaseRepository


class CourseRepository(BaseRepository[Course]):
    model = Course
