import os
import argparse
import subprocess
import qrcode
import qrcode.image.svg
import qrcode.constants


def html_to_qr(html_filename, svg_filename):
    qr_code = qrcode.QRCode(
        version=None,
        image_factory=qrcode.image.svg.SvgPathImage,
        error_correction=qrcode.constants.ERROR_CORRECT_L)
    with open(html_filename, 'rb') as f_html:
        qr_code.add_data('data:text/html,' + f_html.read().decode('utf-8'))
    qr_code.make(fit=True)
    img = qr_code.make_image()
    img.save(svg_filename)


def inline_scripts(html_filename, out_filename):
    subprocess.check_call([
        'inline-script-tags.cmd',
        html_filename,
        out_filename])


def minify(html_filename, out_filename, config_file):
    subprocess.check_call([
        'html-minifier.cmd',
        '--config-file', config_file,
        html_filename,
        '--output', out_filename])


def parse_args():
    parser = argparse.ArgumentParser('Convert HTML page into QR code')
    parser.add_argument('--htmldir',
                        help='directory with html page')
    parser.add_argument('--builddir',
                        help='directory to put bundle and QR code into')
    parser.add_argument('--index',
                        help='filename of root document')
    return parser.parse_args()


def main():
    args = parse_args()

    if not os.path.isdir(args.builddir):
        os.makedirs(args.builddir)

    bundle_filename = os.path.basename(args.htmldir) + '-bundle.html'
    mini_filename = os.path.basename(args.htmldir) + '-minibundle.html'
    svg_filename = os.path.basename(args.htmldir) + '-qrcode.svg'

    inline_scripts(
        os.path.join(args.htmldir, args.index),
        os.path.join(args.builddir, bundle_filename)
    )
    bundle_size = os.stat(os.path.join(args.builddir, bundle_filename)).st_size
    print(f'Bundle size: {bundle_size}')

    minify(
        os.path.join(args.builddir, bundle_filename),
        os.path.join(args.builddir, mini_filename),
        os.path.join(args.htmldir, 'minify.json')
    )
    mini_size = os.stat(os.path.join(args.builddir, mini_filename)).st_size
    print(f'Mini size: {mini_size}')

    html_to_qr(
        os.path.join(args.builddir, mini_filename),
        os.path.join(args.builddir, svg_filename)
    )


if __name__ == '__main__':
    main()
