// custom chakra-ui style https://chakra-ui.com/docs/styled-system/customize-theme
export const CommerceTable = {
  parts: ["table", "th", "td", "thead", "tr", "tbody"],
  variants: {
    striped: {
      table: {

        maxWidth: "1300px",
      },
      thead: {
         backgroundColor: "#006747",
      },
      th: {
         overflowWrap: "break-word",
         padding: "0.5em 1.3em",
         color: "white",
         fontSize: "1em",
      },
      tbody: {
        td: { 
          fontSize: "1.2em",
          padding: "1em",
        },
      },
    },
  },
};
