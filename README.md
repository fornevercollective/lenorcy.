# lenorcy.
Cartomancy







Card	Significance
King of Hearts	An adult man with sandy, dark blond, or light brown hair, with brown, blue, or hazel eyes. Usually a family member or other loved one. Paternal and family-oriented.
King of Diamonds	An adult man with red or light blond hair with blue, green, or gray eyes. Usually a wealthy man in an authority position.
King of Clubs	An adult man with medium or dark brown hair, with brown, blue, or hazel eyes. Usually a married businessman (although business could have a sexual, rather than commercial, interpretation.)
King of Spades	An adult man with dark brown to black hair, and dark brown eyes. Usually a widower or divorced man, or a man from a foreign country. Ambitious and powerful, can be arrogant and deceptive.
Queen of Hearts	An adult woman with sandy, dark blond, or light brown hair, with brown, blue, or hazel eyes. Usually a family member or other loved one. Maternal and family-oriented.
Queen of Diamonds	An adult woman with red or light blond hair with blue, green, or gray eyes. Usually a wealthy woman in an authority position.
Queen of Clubs	An adult woman with medium or dark brown hair, with brown, blue, or hazel eyes. Usually a businesswoman or social butterfly.
Queen of Spades	An adult woman with dark brown to black hair, and dark brown eyes. Usually a widow or divorced woman, or a woman from a foreign country. Ambitious and intelligent, can be cold, calculating, or spiteful.



![Logo](---)


## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## Authors

- [@fornevercollective](https://www.github.com/fornevercollective)


## Appendix

Any additional information goes here


## Demo

Insert gif or link to demo


## Features

- Light/dark mode toggle
- Live previews
- Fullscreen mode
- Cross platform


## Documentation

[Documentation](https://linktodocumentation)


## Installation

Install my-project with npm

```bash
  npm install my-project
  cd my-project
```
    
## Deployment

To deploy this project run

```bash
  npm run deploy
```


## Lessons Learned

What did you learn while building this project? What challenges did you face and how did you overcome them?


## Roadmap

- Additional browser support

- Add more integrations

## Code Test
print ('WELCOME')
print ()
#!/usr/bin/env python

import datetime
import pytz

timezones = (
    'Pacific/Honolulu',
    'America/New_York',
    'Asia/Taipei',

)

if __name__ == '__main__':
    #fmt = '%A %Y-%m-%d %H:%M:%S %Z%z'
    fmt = '%A %Y-%m-%d %H:%M'

    utc = pytz.utc
    utc_now = utc.localize(datetime.datetime.utcnow())

    for tz_name in timezones:
        tz = pytz.timezone(tz_name)
        tz_now = utc_now.astimezone(tz)
        print('{tz_name}: {local_datetime}'.format(
            tz_name = tz_name,
            local_datetime = tz_now.strftime(fmt)
        ))

print ()
import socket

print('host', socket.gethostname())
print('ip', socket.gethostbyname(socket.gethostname()))
print ()
## Code Test