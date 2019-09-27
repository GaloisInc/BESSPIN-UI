# CI/CD

This document describes the setup of CI/CD for the besspin-ui repo.


## Gitlab Runner

Following the documentation available [](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)

We are using the `shell executor`

1- Install Gitlab Runner [](https://docs.gitlab.com/runner/install/linux-manually.html)

```
sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
```

2- Register the runner

```
sudo gitlab-runner register -n \
  --url https://gitlab-ext.galois.com/ \
  --registration-token REGISTRATION_TOKEN \
  --executor shell \
  --description "besspin-ui-runner" \
  --tags "besspin-ui-tag"
```

3- Add gitlab-runner to docker group
```
sudo usermod -aG docker gitlab-runner
```

4- Verify gitlab-runner has access to docker

```
sudo -u gitlab-runner -H docker info
```



# Pipeline CI

The continuous integration script is available at [](https://gitlab-ext.galois.com/ssith/besspin-ui/.gitlab-ci.yml)
