import glob

files = glob.glob('*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '<!-- Social Placeholders -->' in content:
        # We replace the In, Fb, Ig with IDs
        new_content = content.replace(
            '<a href="#" style="display: inline-block; width: 32px; height: 32px; background: #333; border-radius: 50%; text-align: center; line-height: 32px; color: #fff;">In</a>',
            '<a href="#" id="cmsSocialLinkedIn" style="display: inline-block; width: 32px; height: 32px; background: #333; border-radius: 50%; text-align: center; line-height: 32px; color: #fff; text-decoration: none;">In</a>'
        )
        new_content = new_content.replace(
            '<a href="#" style="display: inline-block; width: 32px; height: 32px; background: #333; border-radius: 50%; text-align: center; line-height: 32px; color: #fff;">Fb</a>',
            '<a href="#" id="cmsSocialFacebook" style="display: inline-block; width: 32px; height: 32px; background: #333; border-radius: 50%; text-align: center; line-height: 32px; color: #fff; text-decoration: none;">Fb</a>'
        )
        new_content = new_content.replace(
            '<a href="#" style="display: inline-block; width: 32px; height: 32px; background: #333; border-radius: 50%; text-align: center; line-height: 32px; color: #fff;">Ig</a>',
            '<a href="#" id="cmsSocialInstagram" style="display: inline-block; width: 32px; height: 32px; background: #333; border-radius: 50%; text-align: center; line-height: 32px; color: #fff; text-decoration: none;">Ig</a>'
        )
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print('Updated footer in ' + f)
