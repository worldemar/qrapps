import os
import shutil
import argparse
import subprocess
import qrcode
from qrcode.image.styledpil import StyledPilImage
import qrcode.constants


def html_to_qr(html_filename, png_filename):
    qr_code = qrcode.QRCode(
        version=None,
        image_factory=StyledPilImage,
        border=4,
        box_size=2,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
    )
    with open(html_filename, 'rb') as f_html:
        qr_data = 'data:text/html,' + f_html.read().decode('utf-8')
        qr_code.add_data(qr_data.encode('ascii'))
        print('Data chunks ready:')
        for i in qr_code.data_list:
            print(f'- bytes={len(i.data)} mode={i.mode} content={i.data[:64]}')
        print(f'QR code fit size: {qr_code.best_fit()}')
    qr_code.make(fit=True)
    img = qr_code.make_image()
    img.save(png_filename)


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


def uglify(html_dir, html_tmp_dir):
    def js_filter(file_name):
        return file_name.endswith('.js')
    list_dir = os.listdir(html_dir)
    js_files = list(
        os.path.join(html_dir, x) for x in filter(js_filter, list_dir))
    js_tmp_files = list(
        os.path.join(html_tmp_dir, x) for x in filter(js_filter, list_dir))
    js_pairs = zip(js_files, js_tmp_files)
    for js_pair in js_pairs:
        subprocess.check_call([
            'uglifyjs.cmd',
            '--output', js_pair[1],
            '--warn',
            '--config-file', os.path.join(html_dir, 'uglify.json'),
            '--', js_pair[0]])


def parse_args():
    parser = argparse.ArgumentParser('Convert HTML page into QR code')
    parser.add_argument('--htmldir',
                        help='directory with html page')
    parser.add_argument('--builddir',
                        help='directory to put bundle and QR code into')
    return parser.parse_args()


def main():
    args = parse_args()

    html_tmp_dir = os.path.basename(args.htmldir) + '.tmp'
    app_name = os.path.basename(args.htmldir)
    deploy_directory = os.path.join(args.builddir, app_name)
    if not os.path.isdir(deploy_directory):
        os.makedirs(deploy_directory)

    bundle_filename = os.path.join(html_tmp_dir, 'index.html')
    mini_filename = os.path.join(deploy_directory, 'index.html')
    png_filename = os.path.join(deploy_directory, 'qr.png')

    if os.path.isdir(html_tmp_dir):
        shutil.rmtree(html_tmp_dir)
    shutil.copytree(args.htmldir, html_tmp_dir)
    uglify(args.htmldir, html_tmp_dir)

    tmp_file = os.path.join(html_tmp_dir, 'index.html.tmp')
    inline_scripts(
        os.path.join(html_tmp_dir, 'index.html'),
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
        os.path.join(html_tmp_dir, 'minify.json')
    )
    mini_size = os.stat(mini_filename).st_size
    print(f'Mini size: {mini_size}/2953')

    html_to_qr(
        mini_filename,
        png_filename
    )


if __name__ == '__main__':
    main()
