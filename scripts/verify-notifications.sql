-- Transactional RLS acceptance test: every fixture and change is rolled back.
begin;
create temp table notification_test_ids as select gen_random_uuid() admin_id,gen_random_uuid() alice_id,gen_random_uuid() bob_id,gen_random_uuid() public_id,gen_random_uuid() private_id,gen_random_uuid() draft_id,gen_random_uuid() offer_id;
grant select on notification_test_ids to authenticated;
insert into auth.users(id,raw_user_meta_data,raw_app_meta_data) select admin_id,'{}'::jsonb,'{}'::jsonb from notification_test_ids union all select alice_id,'{}'::jsonb,'{}'::jsonb from notification_test_ids union all select bob_id,'{}'::jsonb,'{}'::jsonb from notification_test_ids;
insert into public.profiles(auth_user_id,role,display_name) select admin_id,'admin','Notification QA' from notification_test_ids on conflict(auth_user_id) do update set role='admin';
select set_config('request.jwt.claim.sub',(select admin_id::text from notification_test_ids),true);
set local role authenticated;
insert into public.sajuteller_notifications(id,title,body,status,published_at,recipient_id,category)
select public_id,'QA public','Public update','published',now(),null,'update' from notification_test_ids union all
select private_id,'QA personal','Private update','published',now(),alice_id,'update' from notification_test_ids union all
select draft_id,'QA draft','Draft only','draft',null,null,'update' from notification_test_ids union all
select offer_id,'QA offer','Promotion','published',now(),null,'offer' from notification_test_ids;
reset role;
select set_config('request.jwt.claim.sub',(select alice_id::text from notification_test_ids),true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.sajuteller_notifications where id in (select draft_id from notification_test_ids))<>0 then raise exception 'Draft leaked';end if;
 if (select count(*) from public.sajuteller_notification_feed(100,0) where id in (select private_id from notification_test_ids))<>1 then raise exception 'Personal delivery missing';end if;
 begin insert into public.sajuteller_notifications(title,body) values('Forbidden','Forbidden');raise exception 'Ordinary user published';exception when insufficient_privilege then null;end;
 begin update public.profiles set role='admin' where auth_user_id=auth.uid();raise exception 'Admin escalation';exception when insufficient_privilege then null;end;
end $$;
insert into public.sajuteller_notification_preferences(user_id,offers_enabled) values(auth.uid(),false);
do $$ begin
 if exists(select 1 from public.sajuteller_notification_feed(100,0) where id in (select offer_id from notification_test_ids)) then raise exception 'Offer opt-out ignored';end if;
end $$;
select public.sajuteller_notifications_mark_all_read();
do $$ begin
 if (select public.sajuteller_notification_unread_count())<>0 then raise exception 'Mark all did not clear unread';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select bob_id::text from notification_test_ids),true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.sajuteller_notifications where id in (select private_id from notification_test_ids)) then raise exception 'Cross-user notification leaked';end if;
 if exists(select 1 from public.sajuteller_notification_reads where user_id in (select alice_id from notification_test_ids)) then raise exception 'Cross-user read status leaked';end if;
 if (select public.sajuteller_notification_unread_count())<2 then raise exception 'Other user read state was changed';end if;
 begin insert into public.sajuteller_notification_reads(notification_id) select private_id from notification_test_ids;raise exception 'Could mark another user message read';exception when insufficient_privilege then null;end;
 begin insert into public.sajuteller_notification_preferences(user_id,offers_enabled) select alice_id,true from notification_test_ids;raise exception 'Cross-user preference write';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform * from public.sajuteller_notifications;raise exception 'Anonymous access';exception when insufficient_privilege then null;end;
 begin perform public.sajuteller_notification_feed();raise exception 'Anonymous RPC access';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'PASS: admin publishing, recipient isolation, drafts hidden, read ownership, offers preference, mark-all, role escalation prevention, anonymous denied; fixtures rolled back' result;
