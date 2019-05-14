import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';  // Analytics

@IonicPage()
@Component({
  selector: 'page-article',
  templateUrl: 'article.html'
})
export class ArticlePage {

    htmlBlock: string;

    constructor(public navCtrl: NavController) {

    }

}


// OLD

/*

  this.htmlBlock = "<img src='img/article_images/article1_1.jpg' /><div class='articleTitle'>What type of headache is it?</div><div class='articleBody'>Understanding the different types of migraine and headaches.<br/>When people hear the term ‘migraine,’ they often think of a severe headache. What they don’t always know is that migraine is a neurological disease and that there are a number of different subtypes of migraine. Find out about the different types of migraine below.<br/><b>Migraine with Aura (Complicated Migraine)—</b><br/>About a quarter of people who experience migraine also experience aura, a series of sensory and visual changes that can range from seeing black dots and zig zags to tingling numbness on one side of the body, or an inability to speak clearly. Aura sets in shortly before or during a migraine, and can last anywhere from 10 to 30 minutes. Aura is the second of migraine’s four stages, and anyone who experiences it will confirm it is an unmistakable warning sign that the severe head pain is on its way.<br/><b>Migraine without Aura (Common Migraine)—</b><br/>Diagnosing migraine without aura can be difficult because the symptoms are similar to several other types of migraine. Pulsing or throbbing pain on one side of the head, photophobia, phonophobia, pain that is made worse by physical activity, and nausea and vomiting are all classic symptoms of Migraine without Aura. The key differentiator is that Common Migraine lacks the warning phases (prodrome and aura) that other types of migraine have.<br/>Migraine without head pain—Also called a Silent or Acephalgic Migraine, this type of migraine can be very alarming as you experience dizzying aura and other visual disturbances, nausea, and other phases of migraine, but no head pain. It can be triggered by any of a person’s regular triggers, and those who get them are likely to experience other types of migraine, too. The International Headache Society classifies this type as typical aura without headache.<br/>Hemiplegic Migraine—If you have ever had a migraine that felt more like a stroke, it was probably a Hemiplegic Migraine. People who experience this type of migraine develop weakness on one side of the body, often with visual aura symptoms and a “pins and needles” sensation, or loss of sensation, on one side of the body. It can last for as little as a few hours to several days. Similar to typical aura without headache, Hemiplegic Migraine doesn’t always include the severe head pain.<br/>Retinal Migraine—When a headache causes you to temporarily lose vision in one eye, it is a Retinal Migraine. Most common in women during their childbearing years, the blindness can last anywhere from a minute to months, but is usually fully reversible. This is a specific type of aura that accompanies a migraine, and it’s a condition we know very little about. What we do know is that Retinal Migraine may be a sign of a more serious issue, and those who experience it should make a point to see a specialist.<br/>Chronic Migraine—If you have a headache more than 15 days a month, you’re probably suffering from chronic migraine. Many of the days often feel like typical migraine, but there may be considerable variability in the severity of the symptoms and head pain on any given day. Some days patients may mistake the pain for a “tension-headache” or “sinus headache” if the pain is less severe. Many patients with chronic migraine also use acute headache pain medications on more than 10-15 days per month, and this can actually lead to even more frequent headache.<br/>Ice pick headaches—Ice pick headaches are pretty self-explanatory. They feel like you’re getting stabbed in the head with an ice pick. They often come on suddenly, delivering an intense, sharp pain. They’re short–usually only lasting 5-30 seconds–but incredibly painful. These headaches occur on the orbit, temple, and parietal area of your head. That’s where your trigeminal nerve is, which is the nerve in your face that’s responsible for biting and chewing, as well as face sensation. The nerve is on the side of your head just past your eye and above your ear. If you get sharp pains in this area, chances are you’re getting ice pick headaches.<br/>Cluster headaches—This is one of the most severe types of pain that a human can experience. With cluster headaches, you’ll feel an almost burning pain around and above your eyes, at your temples, and even moving toward the back of your head. You’ll often also get red or swollen eyes or a runny nose, among other symptoms. Because they occur in such a large area and provoke other symptoms, cluster headaches can be the most irritating headache, and are sometimes referred to as “suicide headaches.”<br/>Cervicogenic headache—When the pain in your head is actually caused by pain in your neck, you probably have a cervicogenic headache. The pain usually comes from the neck or from a lesion on the spine, which is often confused with pain in the back of your head. It’s common for this type of headache to require physical therapy in addition to medication or other treatment.</div>";
  */