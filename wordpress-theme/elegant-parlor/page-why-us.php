<?php
/**
 * Template Name: Why Us
 * Template Post Type: page
 * Description: Why Us page with customizable sections
 */
get_header();

// Get theme options
$main_headline = get_option('elegant_why_us_main_headline', 'Welcome to Elegant Edge');
$main_subheadline = get_option('elegant_why_us_main_subheadline', 'where beauty is personalized');
$main_description = get_option('elegant_why_us_main_description', 'Discover what sets us apart in the beauty industry.');

// Get features
$features = get_option('elegant_why_us_features', array());
if (empty($features)) {
    $features = array(
        array('title' => 'Expert Professionals', 'description' => 'Our highly trained and certified beauty experts'),
        array('title' => 'Premium Quality', 'description' => 'We use only the finest products and materials'),
        array('title' => 'Personalized Service', 'description' => 'Customized treatments tailored to your needs'),
        array('title' => 'Luxury Experience', 'description' => 'A serene and relaxing atmosphere for every visit'),
    );
}

?>

<main id="main" class="site-main why-us-page">
    <!-- Hero Section -->
    <section class="why-us-hero">
        <div class="container">
            <div class="why-us-hero-content">
                <p class="why-us-label">Why Us</p>
                <h1 class="why-us-main-headline" style="color:#121212 !important"><?php echo esc_html($main_headline); ?></h1>
                <p class="why-us-main-subheadline"><?php echo esc_html($main_subheadline); ?></p>
                <p class="why-us-description"><?php echo esc_html($main_description); ?></p>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="why-us-features">
        <div class="container">
            <div class="features-grid">
                <?php foreach ($features as $feature) : ?>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <h3><?php echo esc_html($feature['title']); ?></h3>
                        <p><?php echo esc_html($feature['description']); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Page Content -->
    <section class="why-us-content">
        <div class="container">
            <?php
            while (have_posts()) {
                the_post();
                ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                    <div class="entry-content">
                        <?php the_content(); ?>
                    </div>
                </article>
                <?php
            }
            ?>
        </div>
    </section>
</main>

<style>
    .why-us-page {
        padding: 40px 0;
    }

    .why-us-hero {
        background: linear-gradient(135deg, #d4a574 0%, #e8c5a0 100%);
        color: #121212;
        padding: 80px 0;
        text-align: center;
        margin-bottom: 60px;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }

    .why-us-hero-content {
        animation: fadeInUp 0.8s ease-out;
    }

    .why-us-main-headline {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 15px;
        font-family: 'Poppins', sans-serif;
        color: #121212 !important;
        text-shadow: 0 1px 0 rgba(255,255,255,0.2);
    }

    .why-us-label {
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 13px;
        font-weight: 700;
        color: rgba(18,18,18,0.75);
        background: rgba(255,255,255,0.55);
        border: 1px solid rgba(18,18,18,0.12);
        border-radius: 999px;
        padding: 6px 14px;
        margin-bottom: 14px;
    }

    .why-us-main-subheadline {
        font-size: 28px;
        font-weight: 400;
        margin-bottom: 20px;
        font-family: 'Poppins', sans-serif;
        color: rgba(18,18,18,0.85);
    }

    .why-us-description {
        font-size: 18px;
        max-width: 700px;
        margin: 0 auto;
        color: rgba(18,18,18,0.8);
        line-height: 1.6;
    }

    .why-us-features {
        margin-bottom: 60px;
    }

    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 30px;
    }

    .feature-card {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(212, 165, 116, 0.2);
    }

    .feature-icon {
        font-size: 40px;
        color: #d4a574;
        margin-bottom: 15px;
    }

    .feature-card h3 {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 10px;
        color: #121212;
        font-family: 'Poppins', sans-serif;
    }

    .feature-card p {
        color: #666;
        line-height: 1.6;
        font-size: 16px;
    }

    .why-us-content {
        max-width: 900px;
        margin: 0 auto;
    }

    .why-us-content .entry-content {
        line-height: 1.8;
        color: #333;
    }

    @media (max-width: 768px) {
        .why-us-hero {
            padding: 50px 20px;
        }

        .why-us-main-headline {
            font-size: 32px;
        }

        .why-us-main-subheadline {
            font-size: 20px;
        }

        .why-us-description {
            font-size: 16px;
        }

        .features-grid {
            grid-template-columns: 1fr;
        }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>

<?php get_footer(); ?>