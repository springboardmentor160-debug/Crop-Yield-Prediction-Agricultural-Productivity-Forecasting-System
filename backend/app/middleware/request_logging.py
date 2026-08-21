import logging
import time
import uuid

from fastapi import Request
from starlette.responses import Response

logger = logging.getLogger("yieldsense.request")


async def request_logging_middleware(
    request: Request,
    call_next,
) -> Response:
    """
    Log incoming requests, response status, client IP, request ID,
    and execution time.

    Request bodies and authorization headers are intentionally not logged.
    """
    request_id = request.headers.get(
        "X-Request-ID",
        str(uuid.uuid4()),
    )

    start_time = time.perf_counter()

    client_ip = (
        request.client.host
        if request.client
        else "unknown"
    )

    method = request.method
    path = request.url.path

    if request.url.query:
        path = f"{path}?{request.url.query}"

    logger.info(
        "request_started | request_id=%s | method=%s | path=%s | client_ip=%s",
        request_id,
        method,
        path,
        client_ip,
    )

    try:
        response = await call_next(request)

    except Exception:
        duration_ms = (
            time.perf_counter() - start_time
        ) * 1000

        logger.exception(
            "request_failed | request_id=%s | method=%s | path=%s "
            "| client_ip=%s | duration_ms=%.2f",
            request_id,
            method,
            path,
            client_ip,
            duration_ms,
        )

        raise

    duration_ms = (
        time.perf_counter() - start_time
    ) * 1000

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-MS"] = f"{duration_ms:.2f}"

    log_method = (
        logger.error
        if response.status_code >= 500
        else logger.warning
        if response.status_code >= 400
        else logger.info
    )

    log_method(
        "request_completed | request_id=%s | method=%s | path=%s "
        "| status=%s | duration_ms=%.2f",
        request_id,
        method,
        path,
        response.status_code,
        duration_ms,
    )

    return response