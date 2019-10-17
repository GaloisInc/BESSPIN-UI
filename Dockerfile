FROM ubuntu:bionic

RUN apt-get update
RUN apt-get install -y python3-pip sqlite3
RUN pip3 install flask nose

WORKDIR /besspin-ui
COPY . /besspin-ui

ENV PORT 3784
EXPOSE 3784

CMD ["python3", "server_flask.py"]
