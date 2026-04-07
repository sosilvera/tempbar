# syntax=docker/dockerfile:1

FROM python:3.14

WORKDIR /barman_for_night

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

WORKDIR /barman_for_night/src

EXPOSE 30095
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8080"]