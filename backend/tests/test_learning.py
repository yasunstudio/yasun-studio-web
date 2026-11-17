from app.modules.enrollments.service import _percent


def test_progress_percent() -> None:
    assert _percent(0, 5) == 0
    assert _percent(1, 5) == 20
    assert _percent(5, 5) == 100
    assert _percent(3, 0) == 0  # course without lessons
    assert _percent(7, 5) == 100  # lessons removed after completion → capped


async def test_learner_api_requires_auth(client) -> None:  # type: ignore[no-untyped-def]
    res = await client.get("/api/v1/me/enrollments")
    assert res.status_code == 401
