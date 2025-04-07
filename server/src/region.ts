// change this to the region of the server
export const THIS_REGION: "na" | "local" =
    process.env.NODE_ENV === "production" ? "na" : "local";
