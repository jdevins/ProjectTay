# Use a base image
FROM redis:latest

# Copy application code
#COPY C:\A1\redisconfig /redis.conf
COPY [C:\A21\redis.conf, /usr/local/etc/redis/redis.conf]

# Expose port
EXPOSE 6379

# Run the application
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD redis-cli ping || exit 1




