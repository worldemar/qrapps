import os
import shutil
import argparse
import subprocess
import qrcode
from qrcode.image.styledpil import StyledPilImage
import qrcode.constants


def html_to_url(html_filename, txt_filename):
    with open(html_filename, 'rb') as f_html:
        html_text = f_html.read().decode('utf-8')

    print(f'HTML src size: {len(html_text)}')

    html_text_escaped = html_text

    # % operator (division reminder) is rarely used in JS
    # but can still appear and mess up percent-encoding of Data URL.
    html_text_escaped = html_text_escaped.replace('%', '%' + '25')

    # You might think urllib.parse.quote is a better solution,
    # but it escapes too much stuff and bloats data,
    # significantly reducing effective QR capacity
    html_text_escaped = html_text_escaped.replace('#', '%' + '23')

    print(f'HTML rdy size: {len(html_text_escaped)}')
    data_url = 'data:text/html,' + html_text_escaped
    qr_data_encoded = data_url.encode('ascii')
    with open(txt_filename, 'wb') as f_txt:
        f_txt.write(qr_data_encoded)


def url_to_qr(url_filename, png_filename):
    qr_code = qrcode.QRCode(
        version=None,
        image_factory=StyledPilImage,
        border=4,
        box_size=2,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
    )
    with open(url_filename, 'rb') as f_url:
        html_text = f_url.read().decode('utf-8')
        qr_code.add_data(html_text)
        print('QR data dump:')
        for i in qr_code.data_list:
            print(f'- bytes={len(i.data)} mode={i.mode} content={i.data[:64]}')
        print(f'QR code fit size: {qr_code.best_fit()}')
    qr_code.make(fit=True)
    img = qr_code.make_image()
    img.save(png_filename)


def inline_scripts(html_filename, out_filename):
    subprocess.check_call([
        'inline-script-tags',
        html_filename,
        out_filename])


def inline_stylesheets(html_filename, out_filename):
    subprocess.check_call([
        'inline-stylesheets',
        html_filename,
        out_filename])


def minify(html_filename, out_filename, config_file):
    subprocess.check_call([
        'html-minifier',
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
            'uglifyjs',
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
    url_filename = os.path.join(deploy_directory, 'qr.txt')
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
    print(f'Combined size: {bundle_size}')

    minify(
        bundle_filename,
        mini_filename,
        os.path.join(html_tmp_dir, 'minify.json')
    )
    mini_size = os.stat(mini_filename).st_size
    print(f'Minified size: {mini_size}')

    html_to_url(
        mini_filename,
        url_filename
    )

    url_size = os.stat(url_filename).st_size
    print(f'URL data size: {url_size} of 2953 (QR capacity)')

    if url_size <= 2953:
        url_to_qr(
            url_filename,
            png_filename
        )


if __name__ == '__main__':
    main()
