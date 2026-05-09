# Developing Locally

## Set up a new local MySQL server

The easiest way to do this is to download DBNgin tool here: https://dbngin.com/

Create a new MySQL server from scratch using the default settings DBNgin provides.
Once the new database is created, enable it with the start button.

## Set up MySQL interfacing tool

DBNgin provides a GUI (TablePlus) for interfacing with the MySQL database, but I'm personally using MySQL Workbench.

You can find the download for MySQL Workbench here: https://dev.mysql.com/downloads/workbench/

If you want to use DBNgin's TablePlus you're on your own.  
After installing MySQL Workbench, connect to your new local db instance with the following credentials (if using defaults from DBNgin):

- **Connection Name**: _Doesn't matter, I called mine "spendwatcher_local_dev"_
- **Hostname**: _127.0.0.1_
- **Username**: _root_
- **Port**: _3306_
- **Password**: _Leave blank for now (revisit after "Enabling mysql_native_password")_

Once you have connected to your new local database, it's time to import the spend watcher database structure. In MySQL Workbench do the following:

- Select "Server" > "Data Import"
- Ensure "Import from self contained file" is checked, and select the spendwatcher.sql file (provided in the root of this repo)
- Select "Start import" at the bottom right.
- After completion, verify success by clicking the refresh button under the "Schemas" tab on the left, you should now see "user_information" schema under the list. This contains all the spendwatcher tables.

## Enabling mysql_native_password

I'm using the npm library _mysql_ as a query client, which has some limitations in terms of authentication. _mysql_ only allows _mysql_native_password_ authentication method, whereas newer query clients, like npm _mysql2_ support _caching_sha2_password_ authentication methods.

To resolve this for now, run the following query through MySQL Workbench on our new local version of the table:

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password1';
FLUSH PRIVILEGES;

This will set a password for your local database while modifying the authentication method to be _mysql_native_password_. So after doing this, you will need to update your MySQL Workbench connection details to have the password field be "password1".

## Setting up Environment variables

In order for the application to connect to this local database, create a new file at the root of this application called ".env". Inside this file, add the following lines (I'll have to send secret key etc privately):

```
# DEV DB DETAILS
dbHost = "127.0.0.1"
dbUser = "root"
dbName = "user_information"
dbPass = "password1"

# JSON-Web_Token DETAILS
SECRET_KEY = "<this-must-never-be-committed-to-the-repo>"
JWT_ALGORITHM = "<this-must-never-be-committed-to-the-repo>"
JWT_ISSUER = "<this-must-never-be-committed-to-the-repo>"
JWT_EXPIRY = "30d"

# "PROD" | "DEV"
ENVIRONMENT = "DEV"
```

## Run DB refresh script

TODO: Make a script to create a local development user and mock data for the account
