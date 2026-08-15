"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Film, Upload, ArrowLeft, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const movieSchema = z.object({
  title: z.string().min(2, "Title is required"),
  language: z.string().min(1, "Language is required"),
  genres: z.string().min(1, "At least one genre is required"),
  durationMinutes: z.number().min(1, "Duration required"),
  releaseDate: z.string().min(1, "Release date required"),
  certification: z.string().min(1, "Certification required"),
  description: z.string().min(10, "Description must be at least 10 chars"),
  status: z.enum(["PUBLISHED", "DRAFT", "SCHEDULED", "ARCHIVED"]),
});

type MovieFormData = z.infer<typeof movieSchema>;

export default function CreateEditMoviePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      language: "Bangla",
      genres: "Action, Thriller",
      durationMinutes: 150,
      releaseDate: new Date().toISOString().slice(0, 10),
      certification: "U/A",
      description: "",
      status: "PUBLISHED",
    },
  });

  const onSubmit = async (data: MovieFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      router.push("/movies");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <a href="/movies">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </a>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Create New Movie</h1>
          <p className="text-xs text-muted-foreground">Add film metadata, certification, media assets, and release details.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Movie published successfully to catalog! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription className="text-xs">Film title, duration, genres and certification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Movie Title *</label>
              <Input {...register("title")} placeholder="e.g. Avatar 3: Fire and Ash" />
              {errors.title && <span className="text-[11px] text-destructive mt-1 block">{errors.title.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Language *</label>
                <Input {...register("language")} placeholder="Bangla / English / Hindi" />
                {errors.language && <span className="text-[11px] text-destructive mt-1 block">{errors.language.message}</span>}
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Duration (Minutes) *</label>
                <Input type="number" {...register("durationMinutes")} />
                {errors.durationMinutes && <span className="text-[11px] text-destructive mt-1 block">{errors.durationMinutes.message}</span>}
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Certification *</label>
                <Input {...register("certification")} placeholder="U / U/A / A" />
                {errors.certification && <span className="text-[11px] text-destructive mt-1 block">{errors.certification.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Genres (Comma-separated) *</label>
                <Input {...register("genres")} placeholder="Action, Sci-Fi, Thriller" />
                {errors.genres && <span className="text-[11px] text-destructive mt-1 block">{errors.genres.message}</span>}
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Release Date *</label>
                <Input type="date" {...register("releaseDate")} />
                {errors.releaseDate && <span className="text-[11px] text-destructive mt-1 block">{errors.releaseDate.message}</span>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Synopsis & Description *</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Write full movie synopsis..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {errors.description && <span className="text-[11px] text-destructive mt-1 block">{errors.description.message}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Publishing Status</label>
              <select
                {...register("status")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Media Assets (Rule 24) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Media & Poster Assets</CardTitle>
            <CardDescription className="text-xs">Drag & drop poster and backdrop images.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border/80 rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">Click to upload or drag poster file here</p>
              <p className="text-[10px] text-muted-foreground">PNG, JPG or WEBP up to 10MB (aspect ratio 2:3)</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <a href="/movies">
            <Button variant="outline" type="button" className="h-9 text-xs">
              Cancel
            </Button>
          </a>
          <Button type="submit" disabled={isSubmitting} className="h-9 text-xs font-bold gap-1.5">
            <Save className="h-4 w-4" /> {isSubmitting ? "Saving Movie..." : "Save & Publish"}
          </Button>
        </div>
      </form>
    </div>
  );
}
