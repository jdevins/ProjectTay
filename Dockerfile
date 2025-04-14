# Use a base image
FROM redis:latest

# Copy application code
COPY C:\users\jdevi\projecttay\redis-config /redis.conf

# Expose port
EXPOSE 6379

# Run the application
CMD ["redis-server"]