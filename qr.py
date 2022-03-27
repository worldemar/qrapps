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
        error_correction=qrcode.constants.ERROR_CORRECT_L,
    )
    with open(html_filename, 'rb') as f_html:
        qr_data = 'data:text/html,' + f_html.read().decode('utf-8')
        qr_code.add_data(qr_data.encode('ascii'))
    print(f'QR code fit size: {qr_code.best_fit()}')
    qr_code.make(fit=True)
    img = qr_code.make_image()
    img.save(svg_filename)


def inline_scripts(html_filename, out_filename):
    subprocess.check_call([
        'inline-script-tags.cmd',
        html_filename,
        out_filename])


def inline_stylesheets(html_filename, out_filename):
    subprocess.check_call([
        'inline-stylesheets.cmd',
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

    app_name = os.path.basename(args.htmldir)
    deploy_directory = os.path.join(args.builddir, app_name)
    if not os.path.isdir(deploy_directory):
        os.makedirs(deploy_directory)

    bundle_filename = os.path.join(deploy_directory, 'bundle.html')
    mini_filename = os.path.join(deploy_directory, 'minibundle.html')
    svg_filename = os.path.join(deploy_directory, 'qr.svg')

    tmp_file = os.path.join(args.htmldir, args.index + '.tmp')
    inline_scripts(
        os.path.join(args.htmldir, args.index),
        tmp_file
    )
    inline_stylesheets(
        tmp_file,
        bundle_filename
    )
    os.remove(tmp_file)
    bundle_size = os.stat(bundle_filename).st_size
    print(f'Bundle size: {bundle_size}')

    minify(
        bundle_filename,
        mini_filename,
        os.path.join(args.htmldir, 'minify.json')
    )
    mini_size = os.stat(mini_filename).st_size
    print(f'Mini size: {mini_size}')

    html_to_qr(
        mini_filename,
        svg_filename
    )


if __name__ == '__main__':
    main()
