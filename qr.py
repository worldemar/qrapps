import os
import argparse
import uglipyjs
import qrcode
import qrcode.image.svg


def html_to_qr(html_filename, svg_filename):
    qr_code = qrcode.QRCode(image_factory=qrcode.image.svg.SvgPathImage)
    with open(html_filename, 'rb') as f_html:
        qr_code.add_data(f_html.read())
    qr_code.make(fit=True)
    img = qr_code.make_image()
    img.save(svg_filename)


def uglify(html_filename, ugly_filename):
    html = open(html_filename, 'rb').read()
    ugly = uglipyjs.compile(html)
    print(f'Uglify {html_filename} {len(html)} -> {len(ugly)}')
    open(ugly_filename, 'rb').write(ugly)


def parse_args():
    parser = argparse.ArgumentParser(description='Turn HTML app into QR code')
    parser.add_argument('html', type=str, help='source HTML')
    parser.add_argument('svg', type=str, help='target SVG')
    parser.add_argument('uglify-args', type=str, help='arguments to pass to uglify')

def main():
    html_filename = sys.argv[1]
    svg_filename = html_filename.replace('.html', '.svg')
    html_size = os.stat(html_filename).st_size
    print(f'Generating QR code for {filename_html} ({html_size} bytes)')
    html_to_qr(html_filename, svg_filename)


if __name__ == '__main__':
    main()
