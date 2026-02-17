from django.db import migrations, models
from django.utils.text import slugify


def populate_brand_slugs(apps, schema_editor):
    Brand = apps.get_model('products', 'Brand')
    for brand in Brand.objects.all():
        base_slug = slugify(brand.name_ar, allow_unicode=True) or f'brand-{brand.id}'
        slug = base_slug
        counter = 1
        while Brand.objects.filter(slug=slug).exclude(id=brand.id).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        brand.slug = slug
        brand.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_alter_product_description_and_more'),
    ]

    operations = [
        # Step 1: Add slug field without unique constraint
        migrations.AddField(
            model_name='brand',
            name='slug',
            field=models.SlugField(allow_unicode=True, blank=True, default=''),
            preserve_default=False,
        ),
        # Step 2: Populate slugs for existing brands
        migrations.RunPython(populate_brand_slugs, migrations.RunPython.noop),
        # Step 3: Now enforce unique constraint
        migrations.AlterField(
            model_name='brand',
            name='slug',
            field=models.SlugField(allow_unicode=True, blank=True, unique=True),
        ),
        # Also make logo optional
        migrations.AlterField(
            model_name='brand',
            name='logo',
            field=models.ImageField(blank=True, upload_to='brands/', verbose_name='الشعار'),
        ),
    ]
