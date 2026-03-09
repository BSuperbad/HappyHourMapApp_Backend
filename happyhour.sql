\echo 'Delete and recreate happyhour db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE happyhour;
CREATE DATABASE happyhour;
\connect happyhour

\i happyhour-schema.sql
\i happyhour-seed.sql

\echo 'Delete and recreate happyhour_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE happyhour_test;
CREATE DATABASE happyhour_test;
\connect happyhour_test

\i happyhour-schema.sql
