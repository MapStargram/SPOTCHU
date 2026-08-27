-- DB 최초 생성 시 1회 실행(docker-entrypoint-initdb.d).
-- PostGIS 공간 확장 활성화. 스팟 근처 검색(ST_DWithin) 등에 사용.
CREATE EXTENSION IF NOT EXISTS postgis;
