import os
import qrcode
import qrcode.image.svg


def html_to_qr(filename_html, filename_svg):
    qr_code = qrcode.QRCode(image_factory=qrcode.image.svg.SvgPathImage)
    with open(filename_html, 'rb') as f_html:
        qr_code.add_data(f_html.read())
    qr_code.make(fit=True)
    img = qr_code.make_image()
    img.save(filename_svg)


def main():
    for app_directory in os.listdir():
        if not os.path.isdir(app_directory):
            continue
        html_to_qr(
            os.path.join(app_directory, 'app.html'),
            os.path.join(app_directory, 'app.svg')
        )
    page = '<html><body>\n'
    for app_directory in os.listdir():
        if not os.path.isdir(app_directory):
            continue
        with open(os.path.join(app_directory, 'app.svg'), 'rb') as svg_file:
            svg = svg_file.read().decode('utf-8')
        page += app_directory
        page += '<br/>\n'
        page += svg
        page += '<hr>\n'
    page += '</body></html>'
    with open('apps.html', 'wb') as page_file:
        page_file.write(page.encode('utf-8'))


if __name__ == '__main__':
    main()
