FROM python:3.11-slim

# Install dependencies
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# App runs on 80 by default
EXPOSE 80

CMD ["python", "app.py"]
