FROM artifactory.galois.com:5008/besspin-toolsuite:latest

USER besspinuser
ENV USER besspinuser

ARG TOKEN_NAME
ARG PRIVATE_TOKEN

WORKDIR /clafer

RUN sudo curl --silent --header "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" https://gitlab-ext.galois.com/api/v4/projects/ssith%2Fclafer/repository/archive?sha=master -o clafer.tar
RUN sudo tar xvf clafer.tar && \
    sudo mv clafer-* clafer && \
    sudo chown besspinuser clafer

WORKDIR /clafer/clafer

RUN curl -sSL https://get.haskellstack.org/ | sh
ENV PATH="/home/besspinuser/.local/bin:${PATH}"
RUN stack install clafer
RUN . $HOME/.nix-profile/etc/profile.d/nix.sh

WORKDIR /besspin-ui
COPY . /besspin-ui

# these are for sqlalchemy migration support
WORKDIR /besspin-ui/server
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
RUN pip3 install -r requirements.txt

# have the flask server run on port 3784
ENV PORT 3784
EXPOSE 3784

ENV BESSPIN_CLAFER /home/besspinuser/.local/bin/clafer
CMD ["scripts/entrypoint.sh"]
