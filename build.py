#!/usr/bin/env python3

import os
import qrcode
# import urllib
import qrcode.image.svg

def html_to_qr(filename_html, filename_svg):
    qr = qrcode.QRCode(image_factory=qrcode.image.svg.SvgPathImage)
    qr.add_data(open(filename_html, 'rb').read())
    qr.make(fit=True)
    img = qr.make_image()
    img.save(filename_svg)

def main():
    for d in os.listdir():
        if not os.path.isdir(d):
            continue
        html_to_qr(
            os.path.join(d,'app.html'),
            os.path.join(d,'app.svg')
        )
    page = '<html><body>\n'
    for d in os.listdir():
        if not os.path.isdir(d):
            continue
        # url = urllib.parse.quote(open(os.path.join(d,'app.html'),'rb').read().decode('utf-8'))
        svg = open(os.path.join(d,'app.svg'),'rb').read().decode('utf-8')
        # page += '<a href="" onclick="window.open(\'data:text/html,' + url + '\')">'
        page += d
        page += '<br/>\n'
        page += svg
        page += '<hr>\n'
    page += '</body></html>'
    open('apps.html', 'wb').write(page.encode('utf-8'))

if __name__ == '__main__':
    main()
