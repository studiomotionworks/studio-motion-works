"use client";

import { useState } from "react";
import { Button, TextField, UploadField, useConfig, useDocumentDrawer, useDocumentInfo, useField, useForm, useFormFields } from "@payloadcms/ui";
import type { TextFieldClientProps, UploadFieldClientProps } from "payload";
import { mediaFolderForRecord } from "@/lib/media-folders";

export function MediaUploadField(props: UploadFieldClientProps) {
  const { collectionSlug } = useDocumentInfo();
  const title = useFormFields(([fields]) => fields.title?.value);
  const slug = useFormFields(([fields]) => fields.slug?.value);
  const folder = mediaFolderForRecord(collectionSlug, title || slug);
  const { setValue } = useField({ potentiallyStalePath: props.path });
  const [CreateMediaDrawer, , { openDrawer, closeDrawer, isDrawerOpen }] = useDocumentDrawer({ collectionSlug: "media" });
  const field: UploadFieldClientProps["field"] = { ...props.field };
  field.admin = Object.assign({}, props.field.admin);
  // Own the create drawer so its initial data reaches the server-rendered form.
  field.admin.allowCreate = false;

  return (
    <div>
      <UploadField {...props} field={field} />
      {!props.readOnly && props.field.admin?.allowCreate !== false && (
        <Button buttonStyle="secondary" size="small" disabled={!folder} onClick={openDrawer}>
          Upload new media
        </Button>
      )}
      {!folder && <p>Enter the title before uploading new media.</p>}
      {isDrawerOpen && (
        <CreateMediaDrawer
          initialData={{ prefix: folder }}
          onSave={({ doc }) => {
            setValue(doc.id);
            closeDrawer();
          }}
        />
      )}
    </div>
  );
}

export function MediaFolderField(props: TextFieldClientProps) {
  const { id, setData } = useDocumentInfo();
  const { value } = useField<string>({ path: props.path });
  const { getData, reset, setModified } = useForm();
  const { config } = useConfig();
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const move = async () => {
    setMoving(true);
    setError("");
    setMessage("");
    try {
      const data = getData();
      if (data.file instanceof File) throw new Error("Save the replacement file before moving it.");
      const response = await fetch(
        `${config.serverURL || ""}${config.routes.api}/media/${id}/move-folder`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prefix: value, alt: data.alt }),
        },
      );
      const result = await response.json() as { errors?: { message?: string }[]; doc: ReturnType<typeof getData> };
      if (!response.ok) throw new Error(result.errors?.[0]?.message || "Could not move this file.");
      setData(result.doc);
      await reset(result.doc);
      setModified(false);
      setMessage("File moved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not move this file.");
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <TextField {...props} readOnly={props.readOnly || moving} />
      {id && (
        <Button buttonStyle="secondary" size="small" disabled={moving || props.readOnly} onClick={move}>
          {moving ? "Moving..." : "Move to folder"}
        </Button>
      )}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
