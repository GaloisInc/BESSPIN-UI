FROM ubuntu:bionic

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository "deb http://us.archive.ubuntu.com/ubuntu/ bionic universe multiverse" && \
    apt-get install -y python3-pip sqlite3 ssh git curl && \
    pip3 install flask nose

ARG TOKEN_NAME
ARG PRIVATE_TOKEN
RUN mkdir /root/.ssh/
RUN touch /root/.ssh/known_hosts
RUN ssh-keyscan gitlab-ext.galois.com >> /root/.ssh/known_hosts

RUN touch /root/.gitconfig && \
    echo "[url \"https://${TOKEN_NAME}:${PRIVATE_TOKEN}@gitlab-ext.galois.com/\"]\n\
    insteadOf = \"git@gitlab-ext.galois.com:\"\n\
[url \"git@gitlab-ext.galois.com:\"]\n\
    pushInsteadOf = \"git@gitlab-ext.galois.com:\"" >> /root/.gitconfig


#RUN cat /root/.gitconfig
WORKDIR /clafer
RUN git clone "https://${TOKEN_NAME}:${PRIVATE_TOKEN}@gitlab-ext.galois.com/ssith/clafer.git"

WORKDIR /clafer/clafer
RUN curl -sSL https://get.haskellstack.org/ | sh
ENV PATH="/root/.local/bin:${PATH}"
RUN stack install clafer

WORKDIR /besspin-ui
COPY . /besspin-ui

ENV PORT 3784
EXPOSE 3784

ENV BESSPIN_CLAFER /root/.local/bin/clafer
CMD ["python3", "server_flask.py"]
