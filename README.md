# file-metadata-service

File metadata service allows you to upload file, view file details after processing and track file processing progress.

## Structure

This service itself is a monorepo of two micro services, one for handling user's incoming HTTP requests and another for processing uploaded files and updating metadata in database. The name of the service that handles user's incoming request is `api-server` and name of the service that handles file processing is `file-processor`.

User's upload files to `api-server`, `api-server` write file to local disk and push message to `BullMQ`. `file-processor` then receives message from `BullMQ`, it process file and update metadata and processing status into PostgreSQL database.

### Tech Stack

- Backend Framework - ExpressJs
- Database - PostgreSQL
- ORM - Prisma
- Message Queue - BullMQ(Redis Backed)

## Quick Start

1. Clone Repository

   ```sh
   git clone https://github.com/ats1999/file-metadata-service.git
   ```

2. Run shell script to start services

   ```sh
   cd file-metadata-service

   # this will setup `.env` files and start containers using docker compose
   sh deploy.sh
   ```

3. Access api at http://localhost:3000/

## API Documentation

- https://documenter.getpostman.com/view/17357775/2sB2qXjN3S

## Setup Configurations

<details>
<summary>
api-server/.env
</summary>

```env
PORT=3000
JWT_SECRET=your_jwt_secret

# successful login response returns authorization token, which is valid for 30 days

AUTH_TOKEN_EXPIRY=30d

# limit the size of the file to be uploaded, e.g 10mb, 20mb, 1gb

UPLOAD_FILE_SIZE_LIMIT=10mb

# directory where the uploaded files will be stored, it'll be shared by file-processor and file-processor as well

FILE_UPLOAD_BASE_PATH=/data

# Rate limit for the API requests

# 1 day in milliseconds

UPDATE_RATE_LIMIT_WINDOW_MS=86400000
MAX_UPLOAD_RATE_LIMIT=5

# host `redis` is the name of the redis service in docker-compose

REDIS_HOST=redis
REDIS_PORT=6379

# BullMQ setting to retry the job if it fails

MAX_JOB_RETRY=3

# host `postgres` is the name of the postgres service in docker-compose

DATABASE_URL="postgresql://postgres:postgres@postgres:5432/meta_store"

```

</details>

<details>
<summary>
file-processor/.env
</summary>

```env
# host `postgres` is the name of the postgres service in docker-compose
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/meta_store"

# host `redis` is the name of the redis service in docker-compose
REDIS_HOST=redis
REDIS_PORT=6379

# BullMQ setting to retry the job if it fails
MAX_JOB_RETRY=3
```

</details>

### Features Supported

- Upload File
  - Upload size limit
- Get file info
- Get multiple files info using pagination
- Rate limiter
- Background job processing using `BullMQ`
- Retry file processing using options in `BullMQ` configuration

## Note

- Models are not used because `Prisma` ORM automatically generates models

## Limitations

#### Local Rate Limiter

Current rate limiter used in `api-server` is local to `api-server` and it's state is not shared across instances of other `api-server`. So, following limitations are imposed due to this:

- State of rate limiter will be lost if server is restarted. So, a rate limited user can by pass rate limit during this time.
- State if rate limiter is local, not centralized. So, if we have multiple instance of `api-server`, then each server will apply rate limit independently.

**_Solution:_**
We can use redis to store state if rate limiter. It's centralized, so multiple instances of `api-server` can share same state. State will be persisted even `api-server` is restated.

**_Note:_**
Redis can lose data as well when restarted, but data will be very minimal if we configure redis to recover state from snapshot.

#### Local disk storage

We are storing data on local disk, due to this we'll have following limitations:

**_Note:_** most applications won't face any issue unless they hit the limit of single machine

- `api-server` and `file-processor` can not be deployed independently
- Multiple instance of `api-server` and `file-processor` can not share disk.

**_Solution:_**

- We can use shared file storage, like s3 to resolve above issues

#### BullMQ data loss

`BullMQ` uses redis to store jobs, which is not designed to persist every write. Redis can lose data if crashed/restarted for any reason, so `BullMQ` will lose data as well.

**_Solution:_**

- Cron Job - We can write a cron job that regularly checks PostgresSQL database for files whose current status is either uploaded/processing and status is not updated from longer period of time. We can reschedule those files for processing. SQL schema can be changed, to adapt this need.
- AOF redis: We can use [AOF](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) feature of redis to minimize the loss of data.

If QPS in redis is not very large, then we can use AOF and configure redis to flush every write to disk. It'll give lower performance, but it'll negligible if QPS is not large.

Otherwise, we can use AOF without configuring redis to flush every write to disk and CRON job together.
