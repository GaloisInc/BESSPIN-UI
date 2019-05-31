FROM ubuntu:bionic

RUN apt-get update
RUN apt-get install -y python3-pip sqlite3
RUN pip3 install flask nose

WORKDIR /besspin-ui
COPY . /besspin-ui
