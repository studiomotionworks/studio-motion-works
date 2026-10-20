import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "date", "city"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "subtitle",
      type: "text",
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: ["Exhibition", "Talk", "Workshop", "Opening", "Residency"],
    },
    // "status" is derived from the date, not entered directly. An admin can
    // still flip it manually (e.g. to force-close an event), so it's a real
    // stored field kept in sync by the hook below rather than computed
    // on every frontend fetch.
    {
      name: "status",
      type: "select",
      options: ["upcoming", "past"],
      defaultValue: "upcoming",
      admin: {
        position: "sidebar",
        description:
          "Auto-set from the date on save. Override manually if needed.",
      },
    },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "endDate",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "time",
      type: "text",
      admin: {
        description:
          'Display string, e.g. "6:30 PM IST". Free text since timezone display varies.',
      },
    },
    {
      name: "venue",
      type: "text",
    },
    {
      name: "city",
      type: "text",
    },
    {
      name: "country",
      type: "text",
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "longDescription",
      type: "textarea",
    },
    {
      name: "accent",
      type: "text",
      admin: {
        description: "Hex color, e.g. #C5A065",
      },
    },
    { name: "imageFile", type: "upload", relationTo: "media" },
    {
      name: "rsvpUrl",
      type: "text",
    },
    {
      name: "capacity",
      type: "text",
    },
    {
      name: "artists",
      type: "text",
      hasMany: true,
    },
    {
      name: "tags",
      type: "text",
      hasMany: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const ts = (d?: string | null) => (d ? new Date(d).getTime() : null);
        const changed =
          !originalDoc ||
          ts(data?.date) !== ts(originalDoc.date) ||
          ts(data?.endDate) !== ts(originalDoc.endDate);
  
        if (data?.date && (!data.status || changed)) {
          const end = data.endDate ?? data.date;
          data.status = new Date(end) < new Date() ? "past" : "upcoming";
        }
        return data;
      },
    ],
  },
};
