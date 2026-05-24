"use client";

import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 5 * 1024 * 1024;

type WorkoutImageFieldProps = {
  imageSrc?: string;
};

export function WorkoutImageField({ imageSrc }: WorkoutImageFieldProps) {
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const visibleImage = previewUrl || imageSrc;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div>
      <label className="text-sm font-medium text-stone-700" htmlFor="image">
        训练照片（可选）
      </label>
      <div className="mt-1 rounded-md border border-dashed border-stone-300 bg-white px-3 py-4">
        {visibleImage ? (
          <img
            alt="当前训练照片"
            className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
            src={visibleImage}
          />
        ) : null}
        <label
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-50 px-4 text-sm font-semibold text-orange-800 transition hover:bg-orange-100"
          htmlFor="image"
        >
          <ImagePlus aria-hidden className="h-4 w-4" />
          {visibleImage ? "更换照片" : "添加照片"}
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id="image"
          name="image"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];

            setError("");
            setFileName("");

            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl("");
            }

            if (!file) {
              return;
            }

            if (!acceptedTypes.has(file.type)) {
              event.currentTarget.value = "";
              setError("图片只支持 jpg、png 或 webp。");
              return;
            }

            if (file.size > maxSize) {
              event.currentTarget.value = "";
              setError("图片不能超过 5MB。");
              return;
            }

            setFileName(file.name);
            setPreviewUrl(URL.createObjectURL(file));
          }}
          type="file"
        />
        <p className="mt-2 text-xs leading-5 text-stone-500">
          支持 jpg、png、webp，最大 5MB。
        </p>
        {fileName ? (
          <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            已选择：{fileName}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        ) : null}
        {imageSrc ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-stone-600">
            <input
              className="h-4 w-4 rounded border-stone-300 text-orange-600"
              name="remove_image"
              type="checkbox"
            />
            删除当前照片
          </label>
        ) : null}
      </div>
    </div>
  );
}
