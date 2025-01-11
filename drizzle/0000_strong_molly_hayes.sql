CREATE TYPE "public"."status_absen" AS ENUM('Validasi', 'Belum Validasi');--> statement-breakpoint
CREATE TYPE "public"."jenis_kelamin" AS ENUM('L', 'P');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('terima', 'menunggu', 'tolak');--> statement-breakpoint
CREATE TYPE "public"."jawaban_is_benar_enum" AS ENUM('benar', 'salah');--> statement-breakpoint
CREATE TYPE "public"."kategori" AS ENUM('softskill', 'hardskill');--> statement-breakpoint
CREATE TYPE "public"."jenis_training" AS ENUM('mandatory', 'general knowledge', 'customer requested');--> statement-breakpoint
CREATE TYPE "public"."pelaksanaan_pelatihan_is_selesai_enum" AS ENUM('selesai', 'belum');--> statement-breakpoint
CREATE TYPE "public"."status_ruangan" AS ENUM('dipakai', 'tidak dipakai');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('peserta', 'instruktur', 'admin', 'kepala pelatihan');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('eksternal', 'internal');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "absensi_peserta" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "absensi_peserta_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"id_materi" integer,
	"id_exam" integer,
	"id_peserta" integer NOT NULL,
	"status_absen" "status_absen" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alat" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eksternal" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eksternal_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"alamat" text NOT NULL,
	"no_telp" text NOT NULL,
	"tempat_lahir" text NOT NULL,
	"tanggal_lahir" text NOT NULL,
	"jenis_kelamin" "jenis_kelamin" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permintaanTraining" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "permintaanTraining_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"status" "status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exam" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exam_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelatihan" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" text NOT NULL,
	"id_user" integer NOT NULL,
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"id_feedback_question" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedbackQuestion" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feedbackQuestion_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jawaban" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jawaban_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_opsi_jawaban" integer NOT NULL,
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"jawaban_benar" integer NOT NULL,
	"id_peserta" integer NOT NULL,
	"id_question" integer NOT NULL,
	"is_benar" "jawaban_is_benar_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jawaban_benar" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jawaban_benar_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_question" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "karyawan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "karyawan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nik" integer NOT NULL,
	"nama" text NOT NULL,
	"tanggal_lahir" date NOT NULL,
	"tempat_lahir" text NOT NULL,
	"jenis_kelamin" "jenis_kelamin" NOT NULL,
	"alamat" text NOT NULL,
	"tmt" date NOT NULL,
	"unit_org" text NOT NULL,
	"status" text,
	"posisi" text NOT NULL,
	"email" text,
	"no_telp" text,
	"job_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tableAlat" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tableAlat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"id_alat" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materi" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "materi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"judul" text NOT NULL,
	"konten" text NOT NULL,
	"id_pelatihan" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nilai" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "nilai_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_peserta" integer NOT NULL,
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_peserta" integer NOT NULL,
	"title" text NOT NULL,
	"detail" text NOT NULL,
	"tanggal" date NOT NULL,
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opsi_jawaban" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "opsi_jawaban_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_question" integer NOT NULL,
	"jawaban" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pelatihan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pelatihan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"deskripsi" text NOT NULL,
	"koordinator" text NOT NULL,
	"kategori" "kategori" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question" text NOT NULL,
	"gambar" text,
	"id_exam" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pelaksanaan_pelatihan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pelaksanaan_pelatihan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelatihan" integer NOT NULL,
	"id_instruktur" integer NOT NULL,
	"tanggal_mulai" date NOT NULL,
	"tanggal_selesai" date NOT NULL,
	"jam_mulai" time NOT NULL,
	"jam_selesai" time NOT NULL,
	"jenis_training" "jenis_training" NOT NULL,
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
CREATE TABLE IF NOT EXISTS "sertifikat" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sertifikat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_peserta" integer NOT NULL,
	"id_pelatihan" integer NOT NULL,
	"sertifikasi" text NOT NULL,
	"masa_berlaku" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table_peserta" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "table_peserta_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_pelaksanaan_pelatihan" integer NOT NULL,
	"id_peserta" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_karyawan" integer,
	"id_eksternal" integer,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"nama" text NOT NULL,
	"user_role" "user_role" NOT NULL,
	"user_type" "user_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absensi_peserta" ADD CONSTRAINT "absensi_peserta_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absensi_peserta" ADD CONSTRAINT "absensi_peserta_id_materi_materi_id_fk" FOREIGN KEY ("id_materi") REFERENCES "public"."materi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absensi_peserta" ADD CONSTRAINT "absensi_peserta_id_exam_exam_id_fk" FOREIGN KEY ("id_exam") REFERENCES "public"."exam"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "absensi_peserta" ADD CONSTRAINT "absensi_peserta_id_peserta_users_id_fk" FOREIGN KEY ("id_peserta") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permintaanTraining" ADD CONSTRAINT "permintaanTraining_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exam" ADD CONSTRAINT "exam_id_pelatihan_pelatihan_id_fk" FOREIGN KEY ("id_pelatihan") REFERENCES "public"."pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_id_user_users_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_id_feedback_question_feedbackQuestion_id_fk" FOREIGN KEY ("id_feedback_question") REFERENCES "public"."feedbackQuestion"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "jawaban" ADD CONSTRAINT "jawaban_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "jawaban" ADD CONSTRAINT "jawaban_id_question_question_id_fk" FOREIGN KEY ("id_question") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jawaban_benar" ADD CONSTRAINT "jawaban_benar_id_question_question_id_fk" FOREIGN KEY ("id_question") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tableAlat" ADD CONSTRAINT "tableAlat_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tableAlat" ADD CONSTRAINT "tableAlat_id_alat_alat_id_fk" FOREIGN KEY ("id_alat") REFERENCES "public"."alat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "materi" ADD CONSTRAINT "materi_id_pelatihan_pelatihan_id_fk" FOREIGN KEY ("id_pelatihan") REFERENCES "public"."pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nilai" ADD CONSTRAINT "nilai_id_peserta_users_id_fk" FOREIGN KEY ("id_peserta") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nilai" ADD CONSTRAINT "nilai_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_peserta_users_id_fk" FOREIGN KEY ("id_peserta") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_pelaksanaan_pelatihan_pelaksanaan_pelatihan_id_fk" FOREIGN KEY ("id_pelaksanaan_pelatihan") REFERENCES "public"."pelaksanaan_pelatihan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opsi_jawaban" ADD CONSTRAINT "opsi_jawaban_id_question_question_id_fk" FOREIGN KEY ("id_question") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question" ADD CONSTRAINT "question_id_exam_exam_id_fk" FOREIGN KEY ("id_exam") REFERENCES "public"."exam"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_id_peserta_users_id_fk" FOREIGN KEY ("id_peserta") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_id_pelatihan_pelatihan_id_fk" FOREIGN KEY ("id_pelatihan") REFERENCES "public"."pelatihan"("id") ON DELETE no action ON UPDATE no action;
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
