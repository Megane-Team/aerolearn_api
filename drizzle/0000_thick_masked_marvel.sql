CREATE TABLE IF NOT EXISTS "absensi" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "absensi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_peserta" integer NOT NULL,
	"status_absen" "absensi_peserta" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alat" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"id_pelatihan" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eksternal" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eksternal_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"alamat" text NOT NULL,
	"no_telp" text NOT NULL,
	"tempat_tanggal_lahir" text NOT NULL,
	"jenis_kelamin" "jenis_kelamin" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exam" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exam_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question" text NOT NULL,
	"id_table_materi_all" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jawaban" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jawaban_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_opsi_jawaban" integer NOT NULL,
	"jawaban_benar" integer NOT NULL,
	"id_peserta" integer NOT NULL,
	"id_exam" integer,
	"is_benar" "jawaban_is_benar_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jawaban_benar" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jawaban_benar_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "karyawan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "karyawan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"nik" text NOT NULL,
	"tempat_tanggal_lahir" text NOT NULL,
	"alamat" text NOT NULL,
	"no_telp" text NOT NULL,
	"unit_org" text NOT NULL,
	"jenis_kelamin" "jenis_kelamin" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materi" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "materi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"judul" text NOT NULL,
	"konten" text,
	"id_table_materi_all" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table_MateriAll" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "table_MateriAll_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelatihan" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opsi_jawaban" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "opsi_jawaban_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_exam" integer NOT NULL,
	"jawaban" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pelatihan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pelatihan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"deskripsi" text,
	"koordinator" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pelaksanaan_pelatihan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pelaksanaan_pelatihan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelatihan" integer NOT NULL,
	"id_instruktur" integer NOT NULL,
	"tanggal" date NOT NULL,
	"jam_mulai" time NOT NULL,
	"jam_selesai" time NOT NULL,
	"is_selesai" "pelaksanaan_pelatihan_is_selesai_enum" NOT NULL,
	"id_ruangan" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ruangan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ruangan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"status_ruangan" "status_ruangan" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table_peserta" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "table_peserta_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"id_peserta" integer NOT NULL,
	"total_peserta" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_karyawan" integer,
	"id_eksternal" integer,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"user_role" "user_role" NOT NULL,
	"user_type" "user_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absensi" ADD CONSTRAINT "absensi_id_peserta_users_id_fk" FOREIGN KEY ("id_peserta") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exam" ADD CONSTRAINT "exam_id_table_materi_all_table_MateriAll_id_fk" FOREIGN KEY ("id_table_materi_all") REFERENCES "public"."table_MateriAll"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jawaban" ADD CONSTRAINT "jawaban_id_opsi_jawaban_opsi_jawaban_id_fk" FOREIGN KEY ("id_opsi_jawaban") REFERENCES "public"."opsi_jawaban"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jawaban" ADD CONSTRAINT "jawaban_jawaban_benar_jawaban_benar_id_fk" FOREIGN KEY ("jawaban_benar") REFERENCES "public"."jawaban_benar"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jawaban" ADD CONSTRAINT "jawaban_id_peserta_users_id_fk" FOREIGN KEY ("id_peserta") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "materi" ADD CONSTRAINT "materi_id_table_materi_all_table_MateriAll_id_fk" FOREIGN KEY ("id_table_materi_all") REFERENCES "public"."table_MateriAll"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table_MateriAll" ADD CONSTRAINT "table_MateriAll_id_pelatihan_pelatihan_id_fk" FOREIGN KEY ("id_pelatihan") REFERENCES "public"."pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opsi_jawaban" ADD CONSTRAINT "opsi_jawaban_id_exam_exam_id_fk" FOREIGN KEY ("id_exam") REFERENCES "public"."exam"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelaksanaan_pelatihan" ADD CONSTRAINT "pelaksanaan_pelatihan_id_pelatihan_pelatihan_id_fk" FOREIGN KEY ("id_pelatihan") REFERENCES "public"."pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelaksanaan_pelatihan" ADD CONSTRAINT "pelaksanaan_pelatihan_id_instruktur_users_id_fk" FOREIGN KEY ("id_instruktur") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelaksanaan_pelatihan" ADD CONSTRAINT "pelaksanaan_pelatihan_id_ruangan_ruangan_id_fk" FOREIGN KEY ("id_ruangan") REFERENCES "public"."ruangan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table_peserta" ADD CONSTRAINT "table_peserta_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table_peserta" ADD CONSTRAINT "table_peserta_id_peserta_users_id_fk" FOREIGN KEY ("id_peserta") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_id_karyawan_karyawan_id_fk" FOREIGN KEY ("id_karyawan") REFERENCES "public"."karyawan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_id_eksternal_eksternal_id_fk" FOREIGN KEY ("id_eksternal") REFERENCES "public"."eksternal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
