FROM besspin-user-image:latest AS builder

USER besspinuser
ENV USER besspinuser

ARG TOKEN_NAME
ARG PRIVATE_TOKEN

WORKDIR /clafer

# NOTE: if we can use master, we should switch to just fetching the archive...
#       see https://docs.gitlab.com/ee/api/repositories.html#get-file-archive
RUN sudo git clone --depth=1 "https://${TOKEN_NAME}:${PRIVATE_TOKEN}@gitlab-ext.galois.com/ssith/clafer.git" && \
    sudo chown besspinuser clafer

WORKDIR /clafer/clafer

RUN curl -sSL https://get.haskellstack.org/ | sh
ENV PATH="/home/besspinuser/.local/bin:${PATH}"
RUN stack install clafer

WORKDIR /besspin-ui
COPY . /besspin-ui

# these are for sqlalchemy migration support
WORKDIR /besspin-ui/server
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
RUN pip3 install -r requirements.txt

# Actual image
FROM besspin-user-image:latest AS final

COPY --from=builder /clafer/clafer /clafer/clafer
COPY --from=builder /home/besspinuser/.local /home/besspinuser/.local
COPY --from=builder /besspin-ui /besspin-ui

WORKDIR /besspin-ui

# have the flask server run on port 3784
ENV PORT 3784
EXPOSE 3784

ENV BESSPIN_CLAFER /home/besspinuser/.local/bin/clafer
CMD ["scripts/entrypoint.sh"]
