import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/31
  test("#31 - `convert` method don't group multiple attributes", () => {
    const input = $$.t`
    <resources>
      <string name="app_name" id="app_name">Main title</string>
      <string name="countdown" id="countdown">
          <xliff:g id="count" example="2 days">%1$s</xliff:g>
          until holiday
          <xliff:g id="time" example="5 days">%1$s</xliff:g>
          anything
          <xliff:g id="qwe" example="1 days">%1$s</xliff:g>
      </string>
      <string-array name="numbers" id="numbers">
          <item>One</item>
          <item>two</item>
      </string-array>
      <string-array name="numbers2" id="numbers2">
          <item>Three</item>
          <item>Four</item>
      </string-array>
    </resources>`

    const obj = $$.convert({ convert: { text: 'value' } }, input, { format: 'object', group: true })
    expect(obj).toEqual(
    {
      "resources": {
        "string": [
           {
            "@": {
              "id": "app_name",
              "name": "app_name",
            },
            "value": "Main title",
          },
          {
            "@": {
              "id": "countdown",
              "name": "countdown",
            },
            "value": [
              {
                "xliff:g": {
                  "@": {
                    "example": "2 days",
                    "id": "count",
                  },
                  "value": "%1$s",
                },
              },
              {
                "value": "\n      until holiday\n      ",
              },
              {
                "xliff:g": {
                  "@": {
                    "example": "5 days",
                    "id": "time",
                  },
                  "value": "%1$s",
                },
              },
              {
                "value": "\n      anything\n      ",
              },
              {
                "xliff:g": {
                  "@": {
                    "example": "1 days",
                    "id": "qwe",
                  },
                  "value": "%1$s",
                },
              },
            ],
          },
        ],
        "string-array": [
          {
            "@": {
              "id": "numbers",
              "name": "numbers",
            },
            "item": [
              "One",
              "two",
            ],
          },
          {
            "@": {
              "id": "numbers2",
              "name": "numbers2",
            },
            "item": [
              "Three",
              "Four",
            ],
          },
        ],
      },
    })

  })

})
