# DriveNow invoices
Automatically download invoices from a DriveNow account in PDF format

## Instructions

- login to drive-now.com with your account
- use something like [cookie.txt](https://chrome.google.com/webstore/detail/cookiestxt/njabckikapfpffapmjgojcnbfjonfjfg) to download a `cookies.txt` file for the DriveNow website
- place the `cookies.txt` file in the same directory as this script
- `node index.js <year>` (example: `node index.js 2015`)

If everything goes smooth, you'll have 12 json files representing the monthly recaps in JSON format in the root dir and all the PDFs invoices in the directory `invoices`.

## Disclaimer
Use at your own risk. I hacked this together for personal use, and it's very very rough.

I borrowed the idea, most of the code and this Readme from [@gabro](https://github.com/gabro)'s Car2Go invoicer script (https://github.com/gabro/car2go-invoicer).
