#! /bin/sh

. $HOME/.nix-profile/etc/profile.d/nix.sh

cd server
# DB_PATH=/besspin-ui/server flask db upgrade
flask db upgrade
python3 app.py