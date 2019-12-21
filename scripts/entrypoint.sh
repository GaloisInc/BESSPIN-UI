#! /bin/sh

cd server
# DB_PATH=/besspin-ui/server flask db upgrade
flask db upgrade
python3 app.py