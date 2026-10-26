CREATE SCHEMA "edevlet";
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"password_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edevlet"."vatandaslar" (
	"tckn" char(11) PRIMARY KEY NOT NULL,
	"ad" text NOT NULL,
	"soyad" text NOT NULL,
	"hesap_acildi" boolean DEFAULT false NOT NULL
);
