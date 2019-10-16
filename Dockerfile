FROM python:3 AS builder

WORKDIR /

RUN pip3 install flask

COPY . .

ENV PORT 3784
EXPOSE 3784

CMD ["python3", "server_flask.py"]
