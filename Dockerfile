# Lightweight Python Image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy dependencies
COPY src/lib/submodules/chatgpt/requirements.txt ./requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/lib/submodules/chatgpt/ ./

# Expose port (Railway will override PORT, but good for local)
ENV PORT=6969
EXPOSE 6969

# Run the server
CMD ["python", "api_server.py"]
