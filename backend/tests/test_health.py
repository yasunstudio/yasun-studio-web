from httpx import AsyncClient


async def test_liveness(client: AsyncClient) -> None:
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert "x-request-id" in res.headers


async def test_admin_requires_auth(client: AsyncClient) -> None:
    res = await client.get("/api/v1/admin/courses")
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "unauthorized"
