package com.emulatormayo.app;

import com.emulatormayo.boogie.BoogieIntegration;
import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.webkit.*;
import android.widget.*;
import org.json.JSONObject;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;

public final class MainActivity extends ComponentActivity {
    private static final String ORIGIN="https://appassets.androidplatform.net";
    private static final int IMPORT=41, BIOS=42, SAVE=43, COVER=44;
    private LinearLayout root,toolbar;
    private FrameLayout gameContainer;
    private NativeLibrary library;
    private GameStore store;
    private boolean importingCoop;
    private SharedPreferences prefs;
    private WebView player;
    private PlayerController playerController;
    private View custom;
    private WebChromeClient.CustomViewCallback customCallback;
    private String pendingCore="nes",pendingBios="",pendingCover="",blobToken="",blobName="save",blobMime="application/octet-stream";
    private File blob;
    private OutputStream blobStream;
    private final ExecutorService worker=Executors.newSingleThreadExecutor();

    @Override public void onCreate(Bundle saved){
        super.onCreate(saved);prefs=getSharedPreferences("emulatormayo",MODE_PRIVATE);store=new GameStore(this,prefs);pendingCore=prefs.getString("pickerCore","nes");pendingBios=prefs.getString("pickerBios","");
        root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(getColor(R.color.mayo_background));
        root.setOnApplyWindowInsetsListener((view,insets)->{view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        setContentView(root);WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        library=new NativeLibrary(this,root,store,prefs);library.show();
        getOnBackPressedDispatcher().addCallback(this,new OnBackPressedCallback(true){@Override public void handleOnBackPressed(){if(custom!=null)hideCustom();else if(player!=null)confirmLeave();else library.back();}});
    }
    void openCoop(){
        library.stopInput();
        try{BoogieIntegration.open(this,"emulatormayo");}
        catch(Exception error){toast("Could not open LAN co-op. Try again.");}
    }
    void playCoop(JSONObject game){
        if(importingCoop)return;
        if(!"nes".equals(game.optString("core"))){toast("LAN hosting currently supports NES games.");return;}
        File source=store.file(game.optString("id"),false);
        if(source==null){toast("This game file is missing. Import it again.");return;}
        importingCoop=true;library.stopInput();toast("Preparing your private co-op game copy…");
        String title=game.optString("name","Imported NES game");
        worker.execute(()->{
            boolean ready=false;
            try{BoogieIntegration.importLocal(this,source,title);ready=true;}catch(Exception error){/* Do not expose private paths in the UI. */}
            final boolean imported=ready;
            runOnUiThread(()->{importingCoop=false;if(isFinishing()||isDestroyed())return;if(imported)openCoop();else toast("Could not prepare this NES game for co-op. Check the file and available storage.");});
        });
    }
    void importGames(String core){pendingCore=core;prefs.edit().putString("pickerCore",core).apply();pick(IMPORT,true);}
    void chooseBios(JSONObject game){pendingBios=game.optString("id");prefs.edit().putString("pickerBios",pendingBios).apply();pick(BIOS,false);}
    void chooseCover(JSONObject game){pendingCover=game.optString("id");prefs.edit().putString("pickerCover",pendingCover).apply();try{startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("image/*"),COVER);}catch(Exception error){toast("No image picker is available on this device.");}}
    private void pick(int request,boolean multiple){try{Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*").putExtra(Intent.EXTRA_ALLOW_MULTIPLE,multiple);startActivityForResult(intent,request);}catch(Exception error){toast("No file picker is available on this device.");}}
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==SAVE){
            if(result!=RESULT_OK||data==null||data.getData()==null||blob==null){clearBlob();return;}
            File source=blob;blob=null;Uri destination=data.getData();worker.execute(()->{try(InputStream input=new FileInputStream(source);OutputStream output=getContentResolver().openOutputStream(destination)){if(output==null)throw new IOException();copy(input,output);runOnUiThread(()->toast("Save exported."));}catch(Exception error){runOnUiThread(()->toast("Could not export the save. Retry from the player."));}finally{source.delete();}});return;
        }
        if(request==COVER){
            String id=pendingCover.isEmpty()?prefs.getString("pickerCover",""):pendingCover;pendingCover="";prefs.edit().remove("pickerCover").apply();
            if(result!=RESULT_OK||data==null||data.getData()==null||store.find(id)==null)return;Uri uri=data.getData();
            worker.execute(()->{String failure=null;try{CoverImages.importImage(this,id,uri);}catch(Exception|OutOfMemoryError error){failure=error instanceof IOException?error.getMessage():"Could not import this cover image.";}String message=failure;runOnUiThread(()->{if(isFinishing()||isDestroyed())return;library.coverChanged(id);toast(message==null?"Cover saved privately on this device.":message);});});return;
        }
        if(result!=RESULT_OK||data==null)return;
        if(request!=IMPORT&&request!=BIOS)return;
        List<Uri> documents=new ArrayList<>();if(data.getClipData()!=null){for(int i=0;i<data.getClipData().getItemCount();i++)documents.add(data.getClipData().getItemAt(i).getUri());}else if(data.getData()!=null)documents.add(data.getData());
        final String core=pendingCore,biosId=pendingBios;
        library.message(request==IMPORT?"Importing your games…":"Importing BIOS…");
        worker.execute(()->{
            int imported=0;String issue=null;
            for(Uri uri:documents){try{if(request==IMPORT){store.importGame(uri,core);imported++;}else{JSONObject game=store.find(biosId);if(game!=null)store.bios(game,uri);}}catch(Exception error){issue=error instanceof IOException&&error.getMessage()!=null?error.getMessage():"Could not import this file. Check its access and available storage.";}}
            final String error=issue;final int count=imported;
            runOnUiThread(()->{if(isFinishing()||isDestroyed())return;library.show();toast(error==null?(request==IMPORT?count+" game(s) added to your library.":"BIOS imported."):error);});
        });
    }
    void play(JSONObject game){
        if(!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)){toast("Update Android System WebView or Chrome to play games.");return;}
        if(store.file(game.optString("id"),false)==null){toast("This game file is missing. Import it again.");return;}
        library.suspend();root.removeAllViews();toolbar=new LinearLayout(this);
        Button back=new Button(this);back.setText("‹ Library");back.setAllCaps(false);back.setOnClickListener(v->confirmLeave());toolbar.addView(back,new LinearLayout.LayoutParams(0,dp(48),1));
        Button full=new Button(this);full.setText("Fullscreen");full.setAllCaps(false);full.setOnClickListener(v->fullscreen(true));toolbar.addView(full);root.addView(toolbar);
        player=new WebView(this);playerController=new PlayerController(player);player.setBackgroundColor(Color.BLACK);player.setKeepScreenOn(true);
        WebSettings settings=player.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setMediaPlaybackRequiresUserGesture(true);
        WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/games/",path->gameFile(path,false)).addPathHandler("/bios/",path->gameFile(path,true)).addPathHandler("/",this::asset).build();
        player.setWebViewClient(new WebViewClient(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){if(!request.getMethod().equals("GET")&&!request.getMethod().equals("HEAD"))return missing();WebResourceResponse response=loader.shouldInterceptRequest(request.getUrl());return response==null?missing():response;}
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return !request.getUrl().toString().startsWith(ORIGIN+"/");}
            @Override public void onPageStarted(WebView view,String url,android.graphics.Bitmap icon){if(playerController!=null)playerController.loading();}
            @Override public void onPageFinished(WebView view,String url){if(playerController!=null)playerController.loaded();}
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){if(request.isForMainFrame())toast("The local player could not start. Return to the library and retry.");}
        });
        WebViewCompat.addWebMessageListener(player,"emulatormayoDownload",Collections.singleton(ORIGIN),(view,message,origin,mainFrame,reply)->{if(mainFrame&&ORIGIN.equals(origin.toString()))receiveBlob(message.getData(),reply);});
        WebViewCompat.addWebMessageListener(player,"emulatormayoPlayer",Collections.singleton(ORIGIN),(view,message,origin,mainFrame,reply)->{
            if(view==player&&mainFrame&&ORIGIN.equals(origin.toString())&&"/player.html".equals(Uri.parse(Objects.toString(view.getUrl(),"")).getPath())&&"exit".equals(message.getData())){
                // EmulatorJS has already confirmed Exit. Defer destruction until its callback returns.
                root.post(()->{if(player==view){closePlayer();library.show();}});
            }
        });
        player.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onJsAlert(WebView view,String url,String text,JsResult result){new AlertDialog.Builder(MainActivity.this).setMessage(text).setPositiveButton("OK",(d,w)->result.confirm()).setOnCancelListener(d->result.cancel()).show();return true;}
            @Override public void onShowCustomView(View view,CustomViewCallback callback){if(custom!=null){callback.onCustomViewHidden();return;}custom=view;customCallback=callback;root.setVisibility(View.GONE);((FrameLayout)getWindow().getDecorView()).addView(view,new FrameLayout.LayoutParams(-1,-1));fullscreen(true);}
            @Override public void onHideCustomView(){hideCustom();}
        });
        player.setDownloadListener((url,agent,disposition,mime,length)->exportBlob(url,disposition,mime));
        gameContainer=new FrameLayout(this);gameContainer.addView(player,new FrameLayout.LayoutParams(-1,-1));root.addView(gameContainer,new LinearLayout.LayoutParams(-1,0,1));
        try{game.put("played",System.currentTimeMillis());store.save();}catch(Exception ignored){}
        String address=Uri.parse(ORIGIN+"/player.html").buildUpon().appendQueryParameter("game",game.optString("id")).appendQueryParameter("core",game.optString("core")).appendQueryParameter("name",game.optString("name")).appendQueryParameter("bios",store.file(game.optString("id"),true)==null?"0":"1").build().toString();
        player.loadUrl(address);player.requestFocus();
    }
    private WebResourceResponse asset(String path){
        if(!(path.equals("player.html")||path.equals("player.js")||path.equals("native-gamepad.js")||path.equals("mayo-player.js")||path.startsWith("data/"))||path.contains("..")||path.contains("\\")||path.indexOf(0)>=0)return missing();
        try{String type=path.endsWith(".js")?"application/javascript":path.endsWith(".css")?"text/css":path.endsWith(".html")?"text/html":path.endsWith(".json")?"application/json":path.endsWith(".wasm")?"application/wasm":path.endsWith(".svg")?"image/svg+xml":path.endsWith(".png")?"image/png":path.endsWith(".woff2")?"font/woff2":"application/octet-stream";return response(type,getAssets().open(path));}catch(Exception error){return missing();}
    }
    private WebResourceResponse gameFile(String path,boolean bios){try{String id=path.split("/",2)[0];File file=store.file(id,bios);return file==null?missing():response("application/octet-stream",new FileInputStream(file));}catch(Exception error){return missing();}}
    private WebResourceResponse response(String mime,InputStream input){Map<String,String> headers=new HashMap<>();headers.put("Cross-Origin-Opener-Policy","same-origin");headers.put("Cross-Origin-Embedder-Policy","require-corp");headers.put("X-Content-Type-Options","nosniff");headers.put("Referrer-Policy","no-referrer");headers.put("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' blob: data:; img-src 'self' data: blob:; media-src 'self' blob:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'none'");return new WebResourceResponse(mime,null,200,"OK",headers,input);}
    private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
    private void confirmLeave(){if(playerController!=null)playerController.release();AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Return to your library?").setMessage("Save or export your progress in the player before leaving.").setNegativeButton("Stay",null).setPositiveButton("Library",(d,w)->{closePlayer();library.show();}).create();library.dialog(dialog);dialog.show();}
    private void closePlayer(){hideCustom();fullscreen(false);clearBlob();if(playerController!=null){playerController.close();playerController=null;}if(player!=null){player.stopLoading();player.destroy();player=null;}root.removeAllViews();}
    private void fullscreen(boolean value){getWindow().getDecorView().setSystemUiVisibility(value?View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY:View.SYSTEM_UI_FLAG_VISIBLE);if(toolbar!=null)toolbar.setVisibility(value?View.GONE:View.VISIBLE);}
    private void hideCustom(){if(custom==null)return;((FrameLayout)getWindow().getDecorView()).removeView(custom);custom=null;root.setVisibility(View.VISIBLE);if(customCallback!=null)customCallback.onCustomViewHidden();customCallback=null;fullscreen(false);}
    private void exportBlob(String url,String disposition,String mime){
        if(player==null||!url.startsWith("blob:"+ORIGIN+"/")||blob!=null){toast("Use the player's save or export controls to save progress.");return;}
        try{blob=File.createTempFile("emulatormayo-save-",".tmp",getCacheDir());blobStream=new FileOutputStream(blob);blobToken=UUID.randomUUID().toString();blobName=URLUtil.guessFileName(url,disposition,mime).replaceAll("[\\\\/\\p{Cntrl}]","_");blobMime=mime==null?"application/octet-stream":mime;
            player.evaluateJavascript("(async()=>{const bridge=window.emulatormayoDownload,token="+JSONObject.quote(blobToken)+";let ack;bridge.onmessage=()=>{if(ack){const a=ack;ack=null;a()}};const send=data=>new Promise(resolve=>{ack=resolve;bridge.postMessage(JSON.stringify({...data,token}))});try{const r=await fetch("+JSONObject.quote(url)+");const reader=r.body.getReader();while(true){const {done,value}=await reader.read();if(done)break;for(let i=0;i<value.length;i+=131072){let s='';for(const b of value.subarray(i,i+131072))s+=String.fromCharCode(b);await send({type:'chunk',data:btoa(s)})}}await send({type:'done'})}catch(e){bridge.postMessage(JSON.stringify({type:'error',token}))}})()",null);
        }catch(Exception error){clearBlob();toast("Could not prepare the save export.");}
    }
    private void receiveBlob(String data,androidx.webkit.JavaScriptReplyProxy reply){
        try{if(data==null||data.length()>200000)throw new IOException();JSONObject value=new JSONObject(data);if(blobStream==null||!blobToken.equals(value.optString("token")))return;
            if(value.optString("type").equals("chunk")){if(getCacheDir().getUsableSpace()<4L*1024*1024)throw new IOException();blobStream.write(Base64.decode(value.getString("data"),Base64.DEFAULT));reply.postMessage("ok");}
            else if(value.optString("type").equals("done")){blobStream.close();blobStream=null;reply.postMessage("ok");startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(blobMime).putExtra(Intent.EXTRA_TITLE,blobName),SAVE);}
            else throw new IOException();
        }catch(Exception error){clearBlob();reply.postMessage("error");toast("Save export failed. Check storage and retry.");}
    }
    private void clearBlob(){try{if(blobStream!=null)blobStream.close();}catch(Exception ignored){}if(blob!=null)blob.delete();blob=null;blobStream=null;blobToken="";}
    void quit(){AlertDialog dialog=new AlertDialog.Builder(this).setMessage("Close Emulatormayo?").setNegativeButton("Stay",null).setPositiveButton("Close",(d,w)->finish()).create();library.dialog(dialog);dialog.show();}
    void toast(String text){Toast.makeText(this,text,Toast.LENGTH_LONG).show();}
    private int dp(int value){return Math.round(value*getResources().getDisplayMetrics().density);}
    private static void copy(InputStream input,OutputStream output)throws IOException{byte[] buffer=new byte[65536];int count;while((count=input.read(buffer))!=-1)output.write(buffer,0,count);}
    @android.annotation.SuppressLint("RestrictedApi")
    @Override public boolean dispatchKeyEvent(android.view.KeyEvent event){if(playerController!=null&&(player.hasFocus()||custom!=null)&&playerController.key(event))return true;if(player==null&&library!=null&&library.key(event))return true;return super.dispatchKeyEvent(event);}
    @Override public boolean dispatchGenericMotionEvent(android.view.MotionEvent event){if(playerController!=null&&(player.hasFocus()||custom!=null)&&playerController.motion(event))return true;if(player==null&&library!=null&&library.motion(event))return true;return super.dispatchGenericMotionEvent(event);}
    @Override public void onConfigurationChanged(android.content.res.Configuration config){super.onConfigurationChanged(config);if(player==null&&library!=null)library.show();}
    @Override protected void onPause(){super.onPause();if(library!=null)library.stopInput();if(playerController!=null)playerController.release();if(player!=null)player.onPause();}
    @Override protected void onResume(){super.onResume();if(player!=null)player.onResume();}
    @Override public void onWindowFocusChanged(boolean focused){super.onWindowFocusChanged(focused);if(!focused&&playerController!=null)playerController.release();}
    @Override protected void onDestroy(){if(playerController!=null)playerController.close();if(player!=null)player.destroy();if(library!=null)library.close();clearBlob();worker.shutdown();super.onDestroy();}
}
