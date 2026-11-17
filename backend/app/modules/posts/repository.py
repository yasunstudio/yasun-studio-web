from app.modules.posts.models import Post
from app.shared.repository import BaseRepository


class PostRepository(BaseRepository[Post]):
    model = Post
